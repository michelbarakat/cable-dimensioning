import { Button, List } from "@core/ui-headless";

type ListOption = {
  variant: "text";
  label: string;
  value: string;
};

type SampleDataBoxProps = {
  options: ListOption[];
  onApply: () => void;
};

export function SampleDataBox({ options, onApply }: SampleDataBoxProps) {
  return (
    <div className="bg-surface rounded-sm p-2 border border-section-border flex flex-col gap-2 w-24">
      <List headerText="Sample Data" options={options} />
      <Button
        className="w-full"
        variant="soft"
        color="primary"
        size="sm"
        onClick={onApply}
      >
        Apply
      </Button>
    </div>
  );
}

