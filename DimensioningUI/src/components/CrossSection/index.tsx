import { type CableEngine } from "../../lib/cable_dimensioning";
import Single from "./Single";
import Three from "./Three";
import { Typography } from "@core/ui-headless";

export default function CrossSection({
  cableEngine = null,
}: {
  cableEngine?: CableEngine | null;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Typography level="h1" className="text-center">
        CROSS-SECTION CALCULATION
      </Typography>
      <div className="space-y-6">
        <Single cableEngine={cableEngine} />
        <Three cableEngine={cableEngine} />
      </div>
    </div>
  );
}

