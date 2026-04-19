import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { StudentAPI, AssessmentAPI } from "@/api";
import { ExamEnvironment } from "@/components/ExamEnvironment";
import type { ScheduledTest } from "@/data/mock";
import { motion } from "framer-motion";
import { BrainCircuit } from "lucide-react";

const TakeTest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState<ScheduledTest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
       setLoading(true);
       AssessmentAPI.getById(id)
         .then(res => {
           if (res.success) {
              setTest({
                id: res.data.id,
                title: res.data.title,
                subject: res.data.subject,
                durationMin: res.data.duration,
                questionsCount: res.data.questions?.length
              });
           }
         })
         .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-background">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <BrainCircuit className="h-12 w-12 text-primary" />
        </motion.div>
        <p className="mt-4 text-muted-foreground animate-pulse">Initializing Secure Environment...</p>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-background">
        <h2 className="text-2xl font-bold">Assessment Not Found</h2>
        <p className="text-muted-foreground mt-2">The test might have been removed or is no longer available.</p>
        <button 
          onClick={() => navigate("/student/tests")}
          className="mt-6 text-primary hover:underline"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-background">
      <ExamEnvironment test={test} onClose={() => navigate("/student/tests")} />
    </div>
  );
};

export default TakeTest;
