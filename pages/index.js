import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Home() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetch('/courses.json')
      .then((res) => res.json())
      .then((data) => setCourses(data))
      .catch((error) => console.error('Error fetching courses:', error));
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
            Welcome to EduHub
          </h1>
          <section id="courses">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Our Courses
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
                >
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {course.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{course.description}</p>
                  <p className="text-gray-800 font-bold mb-4">
                    Price: ₹{course.price}
                  </p>
                  <Link
                    href={`/courses/${course.id}`}
                    className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 mr-2"
                  >
                    View Details
                  </Link>
                  <Link
                    href={`/checkout?courseId=${course.id}&courseName=${encodeURIComponent(
                      course.title
                    )}&amount=${course.price}`}
                    className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Enroll Now
                  </Link>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
