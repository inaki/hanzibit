import { NumbersGuide } from "@/components/notebook/numbers-guide";

export default function NumbersPage() {
  return (
    <div data-testid="numbers-page" className="h-full overflow-auto p-6 md:p-10">
      <NumbersGuide />
    </div>
  );
}
