import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { toast } from 'react-toastify';
import { auth, get, ref, child } from '../../../firebase';
import Rating from '../../../components/Rating';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';

export default function MyCourseDetail() {
  const router = useRouter();
  const { useruid, courseid } = router.query;
  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (useruid && courseid) {
      const checkAccess = async () => {
        if (!auth.currentUser || auth.currentUser.uid !== useruid) {
          toast.error('Unauthorized access. Please log in.');
          router.push('/profile');
          return;
        }

        const dbRef = ref(getDatabase());
        const purchaseSnapshot = await get(child(dbRef, `purchases/${useruid}/${courseid}`));
        if (!purchaseSnapshot.exists()) {
          toast.error('You have not purchased this course.');
          router.push(`/courses/${courseid}`);
          return;
        }

        setIsAuthorized(true);

        const savedProgress = JSON.parse(localStorage.getItem(`courseProgress_${courseid}`) || '{}');
        setProgress(savedProgress.progress || 0);

        fetch('/courses.json')
          .then((res) => res.json())
          .then((data) => {
            const foundCourse = data.find((c) => c.id === parseInt(courseid));
            setCourse(foundCourse);
            setIsLoading(false);
          })
          .catch((error) => {
            console.error('Error loading course:', error);
            setIsLoading(false);
          });
      };
      checkAccess();
    }
  }, [useruid, courseid, router]);

  const handleContentComplete = (contentId) => {
    if (!isAuthorized) return;
    const totalItems = course.content.modules.reduce((acc, module) => 
      acc + module.items.length, 0
    );
    const completedItems = JSON.parse(localStorage.getItem(`courseProgress_${courseid}`) || '{}').completedItems || [];
    if (!completedItems.includes(contentId)) {
      completedItems.push(contentId);
      const newProgress = Math.round((completedItems.length / totalItems) * 100);
      localStorage.setItem(`courseProgress_${courseid}`, JSON.stringify({
        progress: newProgress,
        completedItems
      }));
      setProgress(newProgress);
    }
  };

  const groupedContent = course && course.content.modules.reduce((acc, module) => {
    module.items.forEach(item => {
      const type = item.type.charAt(0).toUpperCase() + item.type.slice(1);
      if (!acc[type]) acc[type] = [];
      acc[type].push({ ...item, moduleTitle: module.title });
    });
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!course || !isAuthorized) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-xl text-gray-600">Course not found or unauthorized access</p>
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
                <p><strong>Level:</strong> {course.level}</p>
              </div>
              <div className="progress mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Your Progress</h3>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-indigo-600 h-2.5 rounded-full" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">{progress}% Complete</p>
              </div>
              <div className="course-content">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Course Content</h3>
                {Object.keys(groupedContent).map((type) => (
                  <div key={type} className="mb-6">
                    <h4 className="text-md font-medium text-gray-600 mb-2">{type} Content</h4>
                    <ul className="list-disc list-inside space-y-2 text-gray-600">
                      {groupedContent[type].map((item) => (
                        <li key={item.id} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={JSON.parse(localStorage.getItem(`courseProgress_${courseid}`) || '{}').completedItems?.includes(item.id)}
                            onChange={() => handleContentComplete(item.id)}
                            className="h-4 w-4 text-indigo-600"
                          />
                          {item.type === 'pdf' && (
                            <a 
                              href={item.url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-indigo-600 hover:text-indigo-800"
                            >
                              {item.title} (View PDF - {item.moduleTitle})
                            </a>
                          )}
                          {item.type === 'video' && (
                            <a 
                              href={item.url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-indigo-600 hover:text-indigo-800"
                            >
                              {item.title} (Play Video - {item.moduleTitle})
                            </a>
                          )}
                          {item.type === 'audio' && (
                            <a 
                              href={item.url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-indigo-600 hover:text-indigo-800"
                            >
                              {item.title} (Listen Audio - {item.moduleTitle})
                            </a>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
