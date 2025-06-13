import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function About() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12">
          <div className="success-card">
            <h1 className="text-3xl font-bold text-center mb-4">About LearnSphere</h1>
            <p className="text-gray-600 mb-6">
              LearnSphere is dedicated to providing high-quality, accessible online education to learners worldwide. 
              Our mission is to empower individuals with the knowledge and skills they need to succeed in their personal 
              and professional lives.
            </p>
            <p className="text-gray-600 mb-6">
              Founded in 2023, we partner with industry experts and renowned educators to create comprehensive courses 
              that blend theoretical knowledge with practical applications. Whether you're looking to master a new skill, 
              advance your career, or explore a new passion, LearnSphere has a course for you.
            </p>
            <p className="text-gray-600">
              Join our community of learners and start your journey today!
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
