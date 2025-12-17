// Worker manager for WASM cable dimensioning module
// Handles communication between main thread and Web Worker

type WorkerRequest = 
  | { type: 'init' }
  | { type: 'call'; id: number; functionName: string; args: any[] }
  | { type: 'voltageDropChain'; id: number; params: {
      currentA: number;
      resistivity: number;
      lengths: Float64Array;
      sections: Float64Array;
      count: number;
    }};

type WorkerResponse =
  | { type: 'init'; success: boolean; error?: string }
  | { type: 'result'; id: number; result: any }
  | { type: 'error'; id: number; error: string };

/**
 * Worker Manager - Lazy Initialization
 * 
 * ⚠️ IMPORTANT: Worker and WASM are created LAZILY on first function call.
 * This prevents blocking app startup with:
 * - Worker spin-up time
 * - WASM compilation time
 * - Memory allocation
 * 
 * Worker is only created when the first calculation function is called.
 */
class WorkerManager {
  private worker: Worker | null = null;
  private requestIdCounter = 0;
  private pendingRequests = new Map<number, {
    resolve: (value: any) => void;
    reject: (error: Error) => void;
  }>();
  private initialized = false;
  private initPromise: Promise<void> | null = null;

  constructor() {
    // Worker will be created lazily on first use (not in constructor)
  }

  private getWorker(): Worker {
    // Lazy creation: worker is only created when first needed
    if (!this.worker) {
      // Create worker from the compiled worker file
      // Vite will handle the TypeScript compilation and worker bundling
      this.worker = new Worker(
        new URL('./cableWorker.ts', import.meta.url),
        { type: 'classic' }
      );

      this.worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
        const response = e.data;

        if (response.type === 'init') {
          if (response.success) {
            this.initialized = true;
          }
          // Init doesn't have an id, so we handle it separately
          return;
        }

        const pending = this.pendingRequests.get(response.id);
        if (!pending) {
          console.warn(`No pending request found for id ${response.id}`);
          return;
        }

        this.pendingRequests.delete(response.id);

        if (response.type === 'error') {
          pending.reject(new Error(response.error));
        } else {
          pending.resolve(response.result);
        }
      };

      this.worker.onerror = (error) => {
        console.error('Worker error:', error);
        // Reject all pending requests
        for (const [id, pending] of this.pendingRequests.entries()) {
          pending.reject(new Error(`Worker error: ${error.message}`));
        }
        this.pendingRequests.clear();
      };
    }

    return this.worker;
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise((resolve, reject) => {
      const worker = this.getWorker();
      
      const timeout = setTimeout(() => {
        reject(new Error('Timeout initializing worker'));
      }, 10000);

      const messageHandler = (e: MessageEvent<WorkerResponse>) => {
        if (e.data.type === 'init') {
          clearTimeout(timeout);
          worker.removeEventListener('message', messageHandler);
          
          if (e.data.success) {
            this.initialized = true;
            resolve();
          } else {
            reject(new Error(e.data.error || 'Failed to initialize worker'));
          }
        }
      };

      worker.addEventListener('message', messageHandler);
      worker.postMessage({ type: 'init' } as WorkerRequest);
    });

    return this.initPromise;
  }

  private async sendRequest<T>(request: Omit<WorkerRequest, 'id'>): Promise<T> {
    // Lazy initialization: worker and WASM are created here on first function call
    await this.initialize();

    const id = ++this.requestIdCounter;
    const fullRequest = { ...request, id } as WorkerRequest;

    return new Promise<T>((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });
      this.getWorker().postMessage(fullRequest);
    });
  }

  async callFunction(functionName: string, ...args: any[]): Promise<any> {
    return this.sendRequest({
      type: 'call',
      functionName,
      args,
    });
  }

  async voltageDropChain(params: {
    currentA: number;
    resistivity: number;
    lengths: Float64Array;
    sections: Float64Array;
    count: number;
  }): Promise<number> {
    return this.sendRequest({
      type: 'voltageDropChain',
      params,
    });
  }

  terminate(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
      this.initialized = false;
      this.initPromise = null;
      
      // Reject all pending requests
      for (const [id, pending] of this.pendingRequests.entries()) {
        pending.reject(new Error('Worker terminated'));
      }
      this.pendingRequests.clear();
    }
  }
}

// Singleton instance
let workerManagerInstance: WorkerManager | null = null;

export function getWorkerManager(): WorkerManager {
  if (!workerManagerInstance) {
    workerManagerInstance = new WorkerManager();
  }
  return workerManagerInstance;
}
