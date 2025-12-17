import { type CableEngine } from "../../lib/cable_dimensioning";
import Single from "./Single";
import Three from "./Three";

export default function CrossSection({
  cableEngine = null,
}: {
  cableEngine?: CableEngine | null;
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Cross-Section Calculation</h2>
      <Single cableEngine={cableEngine} />
      <Three cableEngine={cableEngine} />
    </div>
  );
}

