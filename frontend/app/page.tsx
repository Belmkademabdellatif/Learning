import Link from 'next/link';
import { ArrowRight, Code, BookOpen, Award, Bot } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-primary-600">CodeLearn</div>
          <nav className="flex gap-6">
            <Link href="/tracks" className="text-gray-600 hover:text-primary-600">
              Tracks
            </Link>
            <Link href="/login" className="text-gray-600 hover:text-primary-600">
              Login
            </Link>
            <Link
              href="/register"
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-6">
          Master Programming with
          <span className="text-primary-600"> Interactive Learning</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Learn to code with hands-on lessons, real-time code execution, AI-powered assistance, and
          earn certificates.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/register"
            className="bg-primary-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-700 flex items-center gap-2"
          >
            Start Learning Free <ArrowRight />
          </Link>
          <Link
            href="/tracks"
            className="bg-white text-primary-600 border-2 border-primary-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-50"
          >
            Browse Tracks
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-12">Why Choose CodeLearn?</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={<Code className="w-12 h-12 text-primary-600" />}
            title="Live Code Editor"
            description="Write and execute code directly in your browser with instant feedback"
          />
          <FeatureCard
            icon={<BookOpen className="w-12 h-12 text-primary-600" />}
            title="Structured Lessons"
            description="Follow carefully designed learning paths from beginner to expert"
          />
          <FeatureCard
            icon={<Bot className="w-12 h-12 text-primary-600" />}
            title="AI Assistant"
            description="Get instant help from our AI tutor powered by advanced RAG technology"
          />
          <FeatureCard
            icon={<Award className="w-12 h-12 text-primary-600" />}
            title="Earn Certificates"
            description="Receive verified certificates upon completing tracks"
          />
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Start Your Journey?</h2>
          <p className="text-xl mb-8">Join thousands of students learning to code</p>
          <Link
            href="/register"
            className="bg-white text-primary-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 inline-block"
          >
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 CodeLearn. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
