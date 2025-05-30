import { ArrowRight } from "lucide-react";
import { Button } from "../../ui/button";
import Link from "next/link";

export default function HeroCTA() {
  return (
    <div className="flex flex-col gap-2 min-[400px]:flex-row mt-5">
      <Link href="/sign-up">
        <Button
          size="lg"
          className="bg-gradient-to-r from-blue-500 to-yellow-500 text-white"
        >
          Start Trading <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Link>
      <Link href="#how-it-works">
        <Button size="lg" variant="outline">
          Learn More
        </Button>
      </Link>
    </div>
  );
}
