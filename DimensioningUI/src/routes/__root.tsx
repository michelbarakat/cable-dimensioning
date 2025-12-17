import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { loadCableDimensioning, type CableEngine } from "../lib/cable_dimensioning";
import { useEffect, useState, createContext, useContext } from "react";

// Create a React Context for cableEngine
const CableEngineContext = createContext<CableEngine | null>(null);

export const useCableEngine = () => useContext(CableEngineContext);

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const [cableEngine, setCableEngine] = useState<CableEngine | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCableDimensioning()
      .then((engine) => {
        setCableEngine(engine);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Failed to load cable engine:", error);
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="p-4 w-full max-w-6xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl text-center mb-6 font-bold bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            CABLE DIMENSIONING - WEB ASSEMBLY
          </h1>
          <nav className="flex flex-wrap justify-center gap-2 bg-gray-800 rounded-lg p-2 border border-gray-700">
            <Link
              to="/"
              className="px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors [&.active]:bg-blue-600 [&.active]:text-white text-gray-300"
            >
              Home
            </Link>
            <Link
              to="/resistivity"
              className="px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors [&.active]:bg-blue-600 [&.active]:text-white text-gray-300"
            >
              Resistivity
            </Link>
            <Link
              to="/voltage-drop"
              className="px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors [&.active]:bg-blue-600 [&.active]:text-white text-gray-300"
            >
              Voltage Drop
            </Link>
            <Link
              to="/cross-section"
              className="px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors [&.active]:bg-blue-600 [&.active]:text-white text-gray-300"
            >
              Cross Section
            </Link>
            <Link
              to="/power-loss"
              className="px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors [&.active]:bg-blue-600 [&.active]:text-white text-gray-300"
            >
              Power Loss
            </Link>
            <Link
              to="/derating"
              className="px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors [&.active]:bg-blue-600 [&.active]:text-white text-gray-300"
            >
              Derating
            </Link>
            <Link
              to="/standard-sizes"
              className="px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors [&.active]:bg-blue-600 [&.active]:text-white text-gray-300"
            >
              Standard Sizes
            </Link>
            <Link
              to="/canvas"
              className="px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors [&.active]:bg-blue-600 [&.active]:text-white text-gray-300"
            >
              Canvas
            </Link>
          </nav>
        </header>
        {isLoading ? (
          <div className="text-center py-10">
            <p className="text-gray-400">Loading WebAssembly module...</p>
          </div>
        ) : (
          <CableEngineContext.Provider value={cableEngine}>
            <Outlet />
          </CableEngineContext.Provider>
        )}
      </div>
    </div>
  );
}

