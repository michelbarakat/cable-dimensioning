import Chain from "./Chain";
import Single from "./Single";
import Three from "./Three";
import { type CableEngine } from "../../lib/cable_dimensioning";

const VoltageDrop = ({ cableEngine }: { cableEngine: CableEngine | null }) => {
  return (
    <div className="space-y-3 text-center">
      <h2 className="text-2xl font-bold">Voltage Drop Calculations</h2>
      <Single cableEngine={cableEngine} />
      <Three cableEngine={cableEngine} />
      <Chain cableEngine={cableEngine} />
    </div>
  );
};

export default VoltageDrop;
