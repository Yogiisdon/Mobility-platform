import { motion } from "framer-motion";
import { Button } from "../components/ui/button";
import { useStore } from "../store/useStore";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";
import axios from "axios";

export default function LandingPage() {
  const goToApp = useStore((state) => state.goToApp);
  const setActiveTab = useStore((state) => state.setActiveTab);

  const [chartData, setChartData] = useState([]);

  // 🔥 Fetch backend data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8000/predictions/latest?city_id=mumbai"
        );

        const chart = res.data.predictions.slice(0, 20).map((p, i) => ({
          x: i,
          y: p.predicted,
        }));

        setChartData(chart);
      } catch (err) {
        console.error("API error:", err);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#0B1220] to-[#020617] text-white relative">

      {/* Background Grid */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* Glow Effects */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-green-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* CONTENT */}
      <div className="relative z-10">

        {/* Header */}
        <header className="flex justify-between items-center px-8 py-4 border-b border-white/10 bg-white/5 backdrop-blur-xl">
          
          {/* ✅ Clickable Logo */}
          <h1
            onClick={() => window.location.reload()}
            className="font-bold text-lg cursor-pointer bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent"
          >
            MobilityAI
          </h1>

          <div className="flex items-center gap-4">
            <div className="text-green-400 text-xs">● LIVE</div>

            <Button
              variant="outline"
              onClick={() => setActiveTab("login")}
              className="border-white/20 hover:bg-white/10"
            >
              Login
            </Button>

            <Button
              onClick={goToApp}
              className="bg-gradient-to-r from-green-400 to-blue-500 hover:opacity-90 shadow-lg shadow-green-500/20"
            >
              Open App
            </Button>
          </div>
        </header>

        {/* Hero */}
        <section className="px-6 py-24 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 bg-clip-text text-transparent"
          >
            AI-Powered Mobility Intelligence
          </motion.h1>

          {/* ✅ Simple subtitle (metrics removed) */}
          <p className="mt-6 text-gray-400 max-w-2xl mx-auto">
            Real-time demand forecasting platform for ride-hailing, logistics, and urban mobility teams.
          </p>

          <div className="mt-8 flex justify-center gap-4">
            <Button
              size="lg"
              onClick={goToApp}
              className="bg-gradient-to-r from-green-400 to-blue-500 hover:opacity-90 shadow-lg shadow-green-500/20"
            >
              Get Started
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="border-white/20 hover:bg-white/10"
            >
              Book Demo
            </Button>
          </div>
        </section>

        {/* Logos */}
        <section className="text-center text-gray-500 text-sm pb-16">
          Trusted by mobility teams across India
        </section>

        {/* Product Preview */}
        <section className="px-6 pb-24">
          <div className="max-w-6xl mx-auto bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl">
            <div className="grid md:grid-cols-2">
              
              {/* Chart */}
              <div className="h-[300px] p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <Line type="monotone" dataKey="y" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Map Placeholder */}
              <div className="h-[300px] flex items-center justify-center text-gray-500 border-l border-white/10">
                Live Map Preview
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6 px-6 pb-24">
          {["Real-Time Demand", "AI Forecasting", "Zone Analytics"].map(
            (title, i) => (
              <motion.div
                key={i}
                whileInView={{ opacity: 1 }}
                className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300 hover:scale-[1.02]"
              >
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-gray-400 text-sm">
                  Powerful insights for smarter mobility decisions.
                </p>
              </motion.div>
            )
          )}
        </section>

        {/* Pricing */}
        <section className="px-6 pb-24 text-center">
          <h2 className="text-3xl font-bold mb-10">Simple Pricing</h2>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {["Starter", "Pro", "Enterprise"].map((plan, i) => (
              <div
                key={i}
                className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur hover:shadow-xl hover:shadow-blue-500/10 transition"
              >
                <h3 className="text-xl font-semibold">{plan}</h3>
                <p className="mt-4 text-3xl font-bold">
                  ₹{i === 0 ? "0" : i === 1 ? "999" : "Custom"}
                </p>
                <Button className="mt-6 w-full">Choose Plan</Button>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="px-6 pb-24 text-center text-gray-400">
          <h2 className="text-3xl font-bold mb-10 text-white">
            What teams say
          </h2>
          <div className="max-w-4xl mx-auto">
            “This platform transformed how we predict demand across cities.”
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-20 border-t border-white/10 bg-gradient-to-r from-green-500/5 via-transparent to-blue-500/5">
          <h2 className="text-3xl font-bold">
            Ready to optimize mobility?
          </h2>

          <Button
            className="mt-6 bg-gradient-to-r from-green-400 to-blue-500 shadow-lg"
            size="lg"
            onClick={goToApp}
          >
            Start Now
          </Button>
        </section>

        {/* ✅ Footer */}
        <footer className="text-center text-gray-500 text-xs pb-6">
          Powered by <span className="text-white font-medium">MobilityAI</span>
        </footer>

      </div>
    </div>
  );
}