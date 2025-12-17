import { useEffect, useState } from "react";
import Resistivity from "./components/Resistivity/Resistivity";
import VoltageDrop from "./components/VoltageDrop";
import CrossSection from "./components/CrossSection";
import PowerLoss from "./components/PowerLoss/PowerLoss";
import Derating from "./components/Derating/Derating";
import StandardSizes from "./components/StandardSizes/StandardSizes";
import { loadCableDimensioning, type CableEngine } from "./lib/cable_dimensioning";

export default function App() {
  const [cableEngine, setCableEngine] = useState<CableEngine | null>(null);
  useEffect(() => {
    loadCableDimensioning().then(setCableEngine);
  }, []);
  return (
    <div className="p-4 w-full max-w-6xl mx-auto">
      <h1 className="text-3xl text-center mb-4">
        CABLE DIMENSIONING - WEB ASSEMBLY
      </h1>
      <p className="text-center text-gray-400 mb-10 text-sm">
        Powered by WebAssembly running in a Web Worker for optimal performance and responsive UI
      </p>
      
      <Resistivity cableEngine={cableEngine} />
      <hr className="mb-10 mt-5 w-full" />
      
      <VoltageDrop cableEngine={cableEngine} />
      <hr className="mb-10 mt-5 w-full" />
      
      <CrossSection cableEngine={cableEngine} />
      <hr className="mb-10 mt-5 w-full" />
      
      <PowerLoss cableEngine={cableEngine} />
      <hr className="mb-10 mt-5 w-full" />
      
      <Derating cableEngine={cableEngine} />
      <hr className="mb-10 mt-5 w-full" />
      
      <StandardSizes cableEngine={cableEngine} />
    </div>
  );
}
