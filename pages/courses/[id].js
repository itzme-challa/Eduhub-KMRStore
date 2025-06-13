import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { toast } from 'react-toastify';
import Rating from '../../components/Rating';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function CourseDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchased, setIsPurchased] = useState(false);

  useEffect(() => {
    if (id) {
      // Check if course is purchased
      const purchasedCourses = JSON.parse(localStorage.getItem('purchasedCourses') || '[]');
      setIsPurchased(purchasedCourses.includes(parseInt(id)));

      // Load course data
      fetch('/courses.json')
        .then((res) => res.json())
        .then((data) => {
          const foundCourse = data.find((c) => c.id === parseInt(id));
          setCourse(foundCourse);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error('Error loading course:', error);
          setIsLoading(false);
        });
    }
  }, [id]);

  const handleBuyNow = () => {
    if (!course) return;
    router.push({
      pathname: '/checkout',
      query: {
        courseId: course.id,
        courseName: course.name,
        amount: course.price,
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-xl text-gray-600">Course not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="course-detail flex-grow">
        <div className="container mx-auto px-4 py-12">
          <div className="course-container grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="image-container relative w-full h-96">
              <Image
                src={course.image || '/default-course.jpg'}
                alt={course.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 400px"
              />
            </div>
            <div className="content">
              <h1 className="text-3xl font-bold text-gray-800 mb-4">{course.name}</h1>
              <Rating rating={course.rating} />
              <p className="text-gray-600 mb-6">{course.description}</p>
              <div className="meta space-y-2 mb-6">
                <p><strong>Instructor:</strong> {course.instructor}</p>
                <p><strong>Category:</strong> {course.category}</p>
                <p><strong>Duration:</strong> {course.duration}</p>
              </div>
              {isPurchased ? (
                <div className="course-content">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Course Content</h3>
                  <div className="space-y-4">
                    {course.content.pdfs.length > 0 && (
                      <div>
                        <h4 className="text-md font-medium text-gray-600 mb-2">PDF Materials</h4>
                        <ul className="list-disc list-inside space-y-1 text-gray-600">
                          {course.content.pdfs.map((pdf, index) => (
                            <li key={index}>
                              <a href={pdf.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800">
                                {pdf.title}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {course.content.videos.length > 0 && (
                      <div>
                        <h4 className="text-md font-medium text-gray-600 mb-2">Video Lessons</h4>
                        <ul className="list-disc list-inside space-y-1 text-gray-600">
                          {course.content.videos.map((video, index) => (
                            <li key={index}>
                              <a href={video.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800">
                                {video.title}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {course.content.audio.length > 0 && (
                      <div>
                        <h4 className="text-md font-medium text-gray-600 mb-2">Audio Resources</h4>
                        <ul className="list-disc list-inside space-y-1 text-gray-600">
                          {course.content.audio.map((audio, index) => (
                            <li key={index}>
                              <a href={audio.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800">
                                {audio.title}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="features">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">What You'll Learn</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    {course.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                  <div className="flex items-center space-x-6 mt-6">
                    <span className="text-2xl font-bold text-indigo-600">₹{course.price}</span>
                    <button
                      onClick={handleBuyNow}
                      className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
