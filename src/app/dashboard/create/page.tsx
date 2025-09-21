"use client"; // Framer Motion を使用するため

import { motion } from "framer-motion";
import PollForm from "@/components/PollForm";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function CreatePollPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
       <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        戻る
      </Button>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl mx-auto"
      >
        <PollForm />
      </motion.div>
    </div>
  );
}
