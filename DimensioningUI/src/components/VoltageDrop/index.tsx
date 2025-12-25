import Chain from "./Chain";
import Single from "./Single";
import Three from "./Three";
import { type CableEngine } from "../../lib/cable_dimensioning";
import { Typography } from "@core/ui-headless";

const VoltageDrop = ({ cableEngine }: { cableEngine: CableEngine | null }) => {
  return (
    <div className="flex flex-col gap-2">
      <Typography level="h1" className="text-center">
        VOLTAGE DROP CALCULATIONS
      </Typography>
      <div className="space-y-3">
        <Single cableEngine={cableEngine} />
        <Three cableEngine={cableEngine} />
        <Chain cableEngine={cableEngine} />
      </div>
    </div>
  );
};

export default VoltageDrop;
