import Link from 'next/link';
import { ArrowRight, Code, BookOpen, Award, Bot, Zap, CheckCircle } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-b from-primary-50 via-white to-white pt-20 pb-28 px-4">
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-1.5 bg-primary-100 text-primary-700 text-sm font-medium px-3 py-1 rounded-full mb-6">
            <Zap className="w-3.5 h-3.5" /> AI-Powered Code Reviews
          </span>
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
            Master Programming with<br />
            <span className="text-primary-600">Interactive Learning</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
            Structured tracks, real-time code execution, AI tutoring, and verified certificates.
            All in one platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 bg-primary-600 text-white px-8 py-4 rounded-xl text-base font-semibold hover:bg-primary-700 transition-colors shadow-sm"
            >
              Start Learning Free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/tracks"
              className="inline-flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-200 px-8 py-4 rounded-xl text-base font-semibold hover:border-primary-300 hover:text-primary-600 transition-colors"
            >
              <BookOpen className="w-5 h-5" /> Browse Tracks
            </Link>
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="border-y border-gray-100 bg-gray-50 py-6">
        <div className="mx-auto max-w-5xl px-4 flex flex-wrap justify-center gap-8 text-sm text-gray-500">
          {[
            ['10,000+', 'Students enrolled'],
            ['50+', 'Learning tracks'],
            ['500+', 'Coding challenges'],
            ['15,000+', 'Certificates issued'],
          ].map(([num, label]) => (
            <div key={label} className="text-center">
              <p className="text-2xl font-bold text-gray-900">{num}</p>
              <p>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Why Choose CodeLearn?</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Everything you need to go from beginner to job-ready developer.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Code,
                color: 'bg-blue-50 text-blue-600',
                title: 'Live Code Editor',
                desc: 'Write and execute code in your browser with Monaco Editor and instant test feedback.',
              },
              {
                icon: BookOpen,
                color: 'bg-green-50 text-green-600',
                title: 'Structured Tracks',
                desc: 'Follow curated learning paths from beginner to expert with real projects.',
              },
              {
                icon: Bot,
                color: 'bg-purple-50 text-purple-600',
                title: 'AI Code Mentor',
                desc: 'Get personalised feedback on your code with complexity analysis and improvement tips.',
              },
              {
                icon: Award,
                color: 'bg-yellow-50 text-yellow-600',
                title: 'Verified Certificates',
                desc: 'Earn shareable, verifiable PDF certificates upon completing any track.',
              },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 py-24 px-4">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">How It Works</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: '01', title: 'Pick a Track', desc: 'Choose from beginner to expert tracks in JavaScript, Python, Go and more.' },
              { step: '02', title: 'Learn & Practice', desc: 'Follow lessons, complete challenges, and get instant AI feedback on your code.' },
              { step: '03', title: 'Earn a Certificate', desc: 'Complete a track and receive a verifiable PDF certificate to share.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <span className="text-4xl font-extrabold text-primary-100 block mb-3">{step}</span>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary-600 py-20 px-4">
        <div className="mx-auto max-w-2xl text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Your Journey?</h2>
          <p className="text-primary-100 mb-8">Join thousands of students learning to code. No credit card required.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 bg-white text-primary-600 px-8 py-4 rounded-xl text-base font-semibold hover:bg-primary-50 transition-colors"
            >
              Create Free Account <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 border border-primary-400 text-white px-8 py-4 rounded-xl text-base font-semibold hover:bg-primary-700 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10 px-4">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white font-bold text-lg">
            <Code className="w-5 h-5" /> CodeLearn
          </div>
          <div className="flex gap-6 text-sm">
            <Link href="/tracks" className="hover:text-white transition-colors">Tracks</Link>
            <Link href="/login" className="hover:text-white transition-colors">Login</Link>
            <Link href="/register" className="hover:text-white transition-colors">Register</Link>
          </div>
          <p className="text-sm">&copy; {new Date().getFullYear()} CodeLearn. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
