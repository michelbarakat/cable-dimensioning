import Chain from "./Chain";
import Single from "./Single";
import Three from "./Three";
import { type CableEngine } from "../../lib/cable_dimensioning";

const VoltageDrop = ({ cableEngine }: { cableEngine: CableEngine | null }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h2 className="text-3xl font-bold text-white mb-8 text-center">Voltage Drop Calculations</h2>
      <Single cableEngine={cableEngine} />
      <hr className="border-gray-700" />
      <Three cableEngine={cableEngine} />
      <hr className="border-gray-700" />
      <Chain cableEngine={cableEngine} />
    </div>
  );
};

export default VoltageDrop;
