import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { loadCableDimensioning, type CableEngine } from "../lib/cable_dimensioning";
import { useEffect, useState, createContext, useContext } from "react";
import { Typography } from "@core/ui-headless";

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
    <div className="min-h-screen bg-master-bg text-text-primary dark scrollbar">
      <div className="p-4 w-full max-w-6xl mx-auto">
        <header className="mb-4">
          <Typography level="h1" className="text-center mb-2">
            CABLE DIMENSIONING - WEB ASSEMBLY
          </Typography>
          <nav className="flex flex-wrap justify-center gap-2 bg-surface rounded-sm p-1 border border-section-border">

            <Link
              to="/"
              className="p-1 rounded-sm hover:bg-gray-700 transition-colors [&.active]:bg-blue-600 [&.active]:text-white text-gray-300"
            >
              Home
            </Link>
            <Link
              to="/resistivity"
              className="p-1 rounded-sm hover:bg-gray-700 transition-colors [&.active]:bg-blue-600 [&.active]:text-white text-gray-300"
            >
              Resistivity
            </Link>
            <Link
              to="/voltage-drop"
              className="p-1 rounded-sm hover:bg-gray-700 transition-colors [&.active]:bg-blue-600 [&.active]:text-white text-gray-300"
            >
              Voltage Drop
            </Link>
            <Link
              to="/cross-section"
              className="p-1 rounded-sm hover:bg-gray-700 transition-colors [&.active]:bg-blue-600 [&.active]:text-white text-gray-300"
            >
              Cross Section
            </Link>
            <Link
              to="/power-loss"
              className="p-1 rounded-sm hover:bg-gray-700 transition-colors [&.active]:bg-blue-600 [&.active]:text-white text-gray-300"
            >
              Power Loss
            </Link>
            <Link
              to="/derating"
              className="p-1 rounded-sm hover:bg-gray-700 transition-colors [&.active]:bg-blue-600 [&.active]:text-white text-gray-300"
            >
              Derating
            </Link>
            <Link
              to="/standard-sizes"
              className="p-1 rounded-sm hover:bg-gray-700 transition-colors [&.active]:bg-blue-600 [&.active]:text-white text-gray-300"
            >
              Standard Sizes
            </Link>
            <Link
              to="/canvas"
              className="p-1 rounded-sm hover:bg-gray-700 transition-colors [&.active]:bg-blue-600 [&.active]:text-white text-gray-300"
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

