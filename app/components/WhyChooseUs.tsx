import { Globe, Shield, Lock, RefreshCw, ChartColumn } from "lucide-react";

interface FeatureCardProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  bgColor: string;
  iconColor: string;
  title: string;
  description: string;
}

const FeatureCard = ({
  icon: Icon,
  bgColor,
  iconColor,
  title,
  description,
}: FeatureCardProps) => (
  <div className="bg-white p-8 rounded-lg border border-gray-100 shadow-sm">
    <div className="flex justify-center mb-4">
      <div
        className={`w-12 h-12 ${bgColor} rounded-full flex items-center justify-center`}
      >
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
    </div>
    <h3 className="text-xl font-bold text-center mb-2">{title}</h3>
    <p className="text-gray-600 text-center">{description}</p>
  </div>
);

export default function WhyChooseUs() {
  const features = [
    {
      icon: Globe,
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600",
      title: "Global Currencies",
      description:
        "Exchange Naira to major global currencies with real-time rates",
    },
    {
      icon: ChartColumn,
      bgColor: "bg-yellow-100",
      iconColor: "text-yellow-600",
      title: "Crypto Integration",
      description: "Seamlessly convert between fiat and cryptocurrencies",
    },
    {
      icon: Shield,
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600",
      title: "Blockchain Security",
      description: "Enhanced security and transparency with Web3 technology",
    },
    {
      icon: Lock,
      bgColor: "bg-yellow-100",
      iconColor: "text-yellow-600",
      title: "Secure Transactions",
      description: "Advanced encryption and multi-factor authentication",
    },
    {
      icon: RefreshCw,
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600",
      title: "Fast Processing",
      description: "Quick transaction processing with minimal delays",
    },
    {
      icon: ChartColumn,
      bgColor: "bg-yellow-100",
      iconColor: "text-yellow-600",
      title: "Competitive Rates",
      description: "Best-in-market exchange rates with low fees",
    },
  ];

  return (
    <section className="bg-gray-50 w-full">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 text-sm font-medium text-black bg-blue-100 rounded-md mb-4">
            Features
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why Choose NexaFX?
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Our platform combines the best of traditional finance and blockchain
            technology
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              bgColor={feature.bgColor}
              iconColor={feature.iconColor}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
