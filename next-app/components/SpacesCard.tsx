"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRight, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface SpaceCardProps {
  space: {
    id: string;
    name: string;
  };
  handleDeleteSpace: (id: string) => void;
}

export default function SpacesCard({
  space,
  handleDeleteSpace,
}: SpaceCardProps) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [spaceToDelete, setSpaceToDelete] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setSpaceToDelete(id);
    setIsDialogOpen(true);
  };

  const confirmDelete = () => {
    if (spaceToDelete) {
      handleDeleteSpace(spaceToDelete);
      setSpaceToDelete(null);
      setIsDialogOpen(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4 md:p-6"
    >
      <Card className="w-full max-w-3xl overflow-hidden rounded-2xl border border-gray-700 bg-gray-800 transition-all duration-300 ease-in-out hover:shadow-[0_10px_20px_rgba(128,90,213,0.5)]">
        <CardContent className="p-0">
          <motion.div
            className="relative h-48 w-full sm:h-64 md:h-72 lg:h-80 xl:h-96"
            whileHover={{ scale: 1.04 }}
            transition={{ duration: 0.4 }}
          >
            <Image
              src={
                "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              }
              alt="Space image"
              layout="fill"
              objectFit="cover"
              className="rounded-t-2xl"
            />
            <motion.div
              className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/70 to-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            />

            <motion.div
              className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <h2 className="mb-2 text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl lg:text-5xl">
                {space.name}
              </h2>
            </motion.div>
          </motion.div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-2 p-4 sm:p-6 md:flex-row md:justify-between md:space-x-4 md:space-y-0">
          <Button
            variant="outline"
            size="lg"
            className="w-full rounded-lg border-purple-600 bg-purple-700 text-white shadow-md transition-colors duration-300 hover:bg-purple-600 hover:shadow-purple-600/50 md:w-auto"
            onClick={() => router.push(`/dashboard/${space.id}`)}
          >
            <ArrowRight className="mr-2 h-5 w-5" />
            View Space
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="lg"
                className="w-full rounded-lg border-gray-500 bg-gray-600 text-gray-200 shadow-md transition-colors duration-300 hover:bg-gray-700 hover:text-white hover:shadow-gray-500/50 md:w-auto"
                onClick={() => handleDeleteClick(space.id)}
              >
                <Trash2 className="mr-2 h-5 w-5" />
                Delete Space
              </Button>
            </DialogTrigger>
            <DialogContent className="w-full sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this space? This action cannot
                  be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="w-full rounded-lg bg-red-600 text-white shadow-md transition-colors duration-300 hover:bg-red-700 hover:shadow-red-500/50 sm:w-auto"
                  onClick={confirmDelete}
                >
                  Confirm
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
