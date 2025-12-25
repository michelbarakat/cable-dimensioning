import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import {
  loadCableDimensioning,
  type CableEngine,
} from "../lib/cable_dimensioning";
import { useEffect, useState, createContext, useContext } from "react";
import { Alert, Divider, IconButton, Tooltip } from "@core/ui-headless";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Sun01Icon,
  Moon02Icon,
  UserWarning02Icon,
} from "@hugeicons-pro/core-stroke-rounded";
import logoWhite from "../assets/logo_white.png";
import { OfflineIndicator } from "../components/OfflineIndicator";
import { useOnlineStatus } from "../hooks/useOnlineStatus";

// Create a React Context for cableEngine
const CableEngineContext = createContext<CableEngine | null>(null);

export const useCableEngine = () => useContext(CableEngineContext);

// NavButton component that combines Link with Button styling
function NavButton({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className="w-full flex rounded-sm items-center justify-end px-2 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-text-primary hover:bg-accent-100 hover:text-black [&.active]:bg-accent-500 [&.active]:text-white"
    >
      {children}
    </Link>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const [cableEngine, setCableEngine] = useState<CableEngine | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDark, setIsDark] = useState(true);

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

  const isOnline = useOnlineStatus();

  // Apply dark class to html element for Tailwind dark mode
  useEffect(() => {
    const htmlElement = document.documentElement;
    if (isDark) {
      htmlElement.classList.add("dark");
    } else {
      htmlElement.classList.remove("dark");
    }
    // Ensure initial state is applied
    return () => {
      // Cleanup on unmount
    };
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <div className="min-h-screen bg-master-bg text-text-primary scrollbar">
      <div className="flex h-screen">
        <aside className="w-20 bg-neutral-950 p-2 flex flex-col gap-2 dark">
          <div className="flex justify-center">
            <img
              src={logoWhite}
              alt="SmartCraft"
              className="w-full h-auto max-h-12 object-contain"
            />
          </div>
          <Divider />
          <nav className="flex flex-col gap-1">
            <NavButton to="/">Home</NavButton>
            <NavButton to="/resistivity">Resistivity</NavButton>
            <NavButton to="/voltage-drop">Voltage Drop</NavButton>
            <NavButton to="/cross-section">Cross Section</NavButton>
            <NavButton to="/power-loss">Power Loss</NavButton>
            <NavButton to="/derating">Derating</NavButton>
            <NavButton to="/standard-sizes">Standard Sizes</NavButton>
            <NavButton to="/canvas">Canvas</NavButton>
          </nav>
          <Divider />
          <div className="flex flex-col gap-2 items-center">
            <div className="flex items-center gap-2">
              <Tooltip
                size="sm"
                content={
                  isDark ? "Switch to Light Mode" : "Switch to Dark Mode"
                }
              >
                <IconButton
                  onClick={toggleTheme}
                  variant="soft"
                  color="warning"
                  size="sm"
                  icon={
                    <HugeiconsIcon icon={isDark ? Sun01Icon : Moon02Icon} />
                  }
                />
              </Tooltip>
              <OfflineIndicator />
            </div>
            {!isOnline ? (
              <Alert
                size="sm"
                variant="soft"
                color="danger"
                icon={<HugeiconsIcon icon={UserWarning02Icon} />}
              >
                Calculation assets from cache
              </Alert>
            ) : null}
          </div>
        </aside>
        <main className="flex-1 bg-neutral-950 overflow-auto p-2">
          <div className="bg-background h-full">
            {isLoading ? (
              <div className="text-center py-10">
                <p className="text-gray-400">Loading WebAssembly module...</p>
              </div>
            ) : (
              <div className=" bg-surface p-2 rounded-sm">
                <CableEngineContext.Provider value={cableEngine}>
                  <Outlet />
                </CableEngineContext.Provider>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
