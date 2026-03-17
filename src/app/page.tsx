import Link from "next/link";
import { ArrowRight, CheckCircle, Smartphone, QrCode, Sparkles, Zap, Shield } from "lucide-react";
import { auth } from "@/auth";

export default async function Home() {
    const session = await auth();

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute top-20 -left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float"></div>
                <div className="absolute bottom-20 -right-20 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
            </div>

            {/* Navbar */}
            <nav className="p-6 flex items-center justify-between max-w-7xl mx-auto w-full relative z-10">
                <div className="font-bold text-2xl tracking-tighter gradient-text">Linkle.</div>
                <div className="flex items-center gap-3">
                    {session ? (
                        <>
                            {session.user?.username && (
                                <Link href={`/p/${session.user.username}`} target="_blank" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                                    My Linkle
                                </Link>
                            )}
                            <Link href="/dashboard">
                                <button className="px-5 py-2 rounded-full gradient-bg text-white font-medium hover:opacity-90 transition-all hover:scale-105 shadow-glow">
                                    Dashboard
                                </button>
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mr-2">
                                Login
                            </Link>
                            <Link href="/register">
                                <button className="px-5 py-2 rounded-full gradient-bg text-white font-medium hover:opacity-90 transition-all hover:scale-105 shadow-glow">
                                    Get Started
                                </button>
                            </Link>
                        </>
                    )}
                </div>
            </nav>

            {/* Hero */}
            <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass dark:glass-dark text-sm font-medium mb-8 shadow-sm">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    <span>New: Crypto Payments Supported</span>
                </div>

                <h1 className="text-6xl md:text-8xl font-black tracking-tighter max-w-4xl mb-6 leading-tight">
                    One Link. <br />
                    <span className="gradient-text">Endless Possibilities.</span>
                </h1>

                <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-2xl mb-12 leading-relaxed font-light">
                    The only digital profile you need. Share your socials, business links, location, and collect payments—all from a single QR code.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-4 mb-20">
                    <Link href={session ? "/dashboard" : "/register"}>
                        <button className="px-8 py-4 rounded-full gradient-bg text-white font-bold text-lg flex items-center gap-2 hover:scale-105 transition-all shadow-glow">
                            {session ? "Go to Dashboard" : "Create your Linkle"} <ArrowRight className="w-5 h-5" />
                        </button>
                    </Link>
                    {!session && (
                        <Link href="/p/demo">
                            <button className="px-8 py-4 rounded-full border-2 border-gray-300 dark:border-zinc-700 font-semibold text-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all hover:scale-105">
                                View Demo
                            </button>
                        </Link>
                    )}
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl w-full text-left">
                    <FeatureCard
                        icon={<Smartphone className="w-7 h-7" />}
                        title="Mobile First"
                        description="Designed to look stunning on every device. Your profile works like a native app."
                        color="blue"
                    />
                    <FeatureCard
                        icon={<QrCode className="w-7 h-7" />}
                        title="Instant QR"
                        description="Get a unique QR code automatically. Perfect for business cards and events."
                        color="purple"
                    />
                    <FeatureCard
                        icon={<Zap className="w-7 h-7" />}
                        title="Lightning Fast"
                        description="Update your links once, and they change everywhere. No re-printing required."
                        color="pink"
                    />
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-3 gap-8 mt-24 max-w-3xl w-full">
                    <StatCard number="10K+" label="Active Users" />
                    <StatCard number="50K+" label="QR Scans" />
                    <StatCard number="99.9%" label="Uptime" />
                </div>
            </main>

            <footer className="py-10 text-center text-gray-500 dark:text-gray-400 text-sm border-t border-gray-200 dark:border-zinc-800">
                <div className="max-w-7xl mx-auto px-4">
                    <p>&copy; {new Date().getFullYear()} Linkle. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, description, color }: {
    icon: React.ReactNode,
    title: string,
    description: string,
    color: 'blue' | 'purple' | 'pink'
}) {
    const colorClasses = {
        blue: 'from-blue-500/10 to-cyan-500/10 group-hover:from-blue-500/20 group-hover:to-cyan-500/20',
        purple: 'from-purple-500/10 to-pink-500/10 group-hover:from-purple-500/20 group-hover:to-pink-500/20',
        pink: 'from-pink-500/10 to-rose-500/10 group-hover:from-pink-500/20 group-hover:to-rose-500/20'
    };

    return (
        <div className="group p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 transition-all hover:scale-105 hover:shadow-xl cursor-pointer">
            <div className={`w-14 h-14 bg-gradient-to-br ${colorClasses[color]} rounded-2xl flex items-center justify-center mb-5 transition-all group-hover:scale-110`}>
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{title}</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{description}</p>
        </div>
    )
}

function StatCard({ number, label }: { number: string, label: string }) {
    return (
        <div className="text-center">
            <div className="text-4xl md:text-5xl font-black gradient-text mb-2">{number}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">{label}</div>
        </div>
    );
}
