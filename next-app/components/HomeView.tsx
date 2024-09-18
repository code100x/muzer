"use client";
import { toast } from "react-toastify";
import { Appbar } from "@/components/Appbar";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CardSkeleton from "./ui/cardSkeleton";



interface Space {
  endTime?: Date | null;
  hostId: string;
  id: string;
  isActive: boolean;
  name: string;
  startTime: Date | null;
}

export default function HomeView() {
  const [isCreateSpaceOpen, setIsCreateSpaceOpen] = useState(false);
  const [spaceName, setSpaceName] = useState("");
  const [spaces, setSpaces] = useState<Space[] | null>(null);
  const [loading, setIsLoading] = useState(false);
  const router = useRouter();
  useEffect(() => {
    const fetchSpaces = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/spaces', {
          method: 'GET',
        });
        
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to fetch spaces");
        }
         const fetchedSpaces: Space[] = data.spaces;
         setSpaces(fetchedSpaces);

      } catch (error) {
        toast.error("Error fetching spaces");
      }
      finally {
        setIsLoading(false);
      }
    };
    fetchSpaces();
  }, []);

  const handleCreateSpace = async () => {
    setIsCreateSpaceOpen(false);
    try {
      const response = await fetch(`/api/spaces`,{
        method:"POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
            spaceName:spaceName
        }),
      })
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to create space");
      }
      const newSpace=data.space;
      setSpaces((prev) => {
        
        const updatedSpaces: Space[] = prev ? [...prev, newSpace] : [newSpace];
        return updatedSpaces;
      });
      toast.success(data.message);

    } catch (error:any) {
      toast.error(error.message || "Error Creating Space");
    }
    
  };

  const handleDeleteSpace=async(spaceId:string)=>{
    try {
      const response = await fetch(`/api/spaces/?spaceId=${spaceId}`,{
        method:"DELETE",
      })
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to delete space");
      }
      setSpaces((prev) => {
        
        const updatedSpaces: Space[] = prev ? prev.filter(space => space.id !== spaceId) : [];
        return updatedSpaces;
      });
      toast.success(data.message);
    } catch (error:any) {
      toast.error(error.message || "Error Deleting Space");
    }
   
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-900 to-black text-gray-200">
      <Appbar />
      <div className=" flex flex-col items-center  flex-grow  px-4 py-8">
        <div className=" rounded-xl text-9xl h-36 bg-clip-text text-transparent bg-gradient-to-r  from-indigo-600 to-violet-900  font-bold">Spaces</div>
        <Button
          onClick={() => {
            setIsCreateSpaceOpen(true);
          }}
          className="bg-purple-600 rounded-lg mt-10  py-2 px-4 hover:bg-purple-700 text-white"
        >
          Create a new Space
        </Button>

        <div className="grid gap-8 grid-cols-1 mt-20 md:grid-cols-2 p-4">
          {loading && <div className="py-4 dark  h-[500px] w-full sm:w-[450px] lg:w-[500px] mx-auto"> <CardSkeleton /></div>}
          {loading && <div className="py-4 dark  h-[500px] w-full sm:w-[450px] lg:w-[500px] mx-auto"> <CardSkeleton /></div>}
          
          {!loading &&
            spaces &&
            spaces.map((space) => {
              return (
                <Card
                  key={space.id}
                  className="py-4 bg-[#18181b] h-[500px] w-full sm:w-[450px] lg:w-[500px] border-0 rounded-3xl mx-auto"
                >
                  <CardHeader className="pb-0 pt-2 px-4 flex-col text-white justify-center items-center ">
                    <div className=" text-4xl font-bold">{space.name}</div>
                  </CardHeader>
                  <CardContent className="overflow-visible flex flex-col justify-center  items-center  py-2">
                    <Image
                      width={450}
                      height={300}
                      alt="Card background"
                      className="object-cover w-[28rem] rounded-3xl"
                      src="https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    />
                    <div className="flex justify-between space-x-6">
                      <Button
                        onClick={() => {
                          router.push(`/dashboard/${space.id}`);
                        }}
                        className="bg-purple-600 rounded-lg mt-10  py-2 px-4 hover:bg-purple-700 text-white"
                      >
                        View Space
                      </Button>

                      <Button onClick={()=>{
                        handleDeleteSpace(space.id)
                      }} className="bg-purple-600 rounded-lg mt-10  py-2 px-4 hover:bg-purple-700 text-white">
                        Delete This Space
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
        </div>
      </div>

      <Dialog open={isCreateSpaceOpen} onOpenChange={setIsCreateSpaceOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center mb-10">
              Create new space
            </DialogTitle>
            <fieldset className="Fieldset">
              <label
                className="text-violet11 w-[90px] font-bold  text-right text-xl "
                htmlFor="name"
              >
                Name of the Space
              </label>
              <input
                className="text-violet11 mt-5 shadow-violet7 focus:shadow-violet8 inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none shadow-[0_0_0_1px] outline-none focus:shadow-[0_0_0_2px]"
                id="name"
                defaultValue="Pedro Duarte"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setSpaceName(e.target.value);
                }}
              />
            </fieldset>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateSpaceOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateSpace}
              className="bg-purple-600  hover:bg-purple-700 text-white"
            >
              Create Space
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
