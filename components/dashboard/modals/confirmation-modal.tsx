import { Button } from "@/components/ui/but";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { ConversionData } from "@/types";
import { ArrowRight, Info, X } from "lucide-react";
import { useState } from "react";
import { millify } from "millify";
type ConfirmationModalProp = {
  data: ConversionData;
};
export function ConfirmationModal(Props: ConfirmationModalProp) {
  const { data } = Props;
  const [modalScene, setModalScene] = useState<
    "confirm" | "processing" | "success"
  >("confirm");

  console.log("Modal Scene", modalScene);
  console.log("Conversion Data", data);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black rounded-sm font-semibold h-[65px] text-xl rounded-lg">
          Convert
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] py-6 px-0 shadow-md">
        {modalScene === "confirm" && (
          <div className="px-4 w-full">
            <DialogHeader className=" flex flex-row py-3  w-full items-center justify-between">
              <DialogTitle>{"You're about to convert"}</DialogTitle>
              <DialogClose className=" cursor-pointer ">
                <X className="w-4 h-4" />
              </DialogClose>
            </DialogHeader>
            <div className="space-y-6 w-full px-4 ">
              <div className="flex items-center w-full justify-between py-4 gap-4">
                <div className="text-center flex items-center justify-center gap-2">
                  <div className="text-2xl ">
                    {millify(Number(data.fromAmount.replace(",", "")))}
                  </div>
                  <div className="text-lg text-black font-bold">
                    {data.fromCurrency}
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 " />
                <div className="text-center flex items-center justify-center gap-2">
                  <div className="text-2xl ">
                    {millify(Number(data.toAmount.replace(",", "")))}
                  </div>
                  <div className="text-lg text-black font-bold">
                    {data.toCurrency}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span>Fees</span>
                  <Info className="w-4 h-4 text-gray-400" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-200 rounded flex items-center justify-center">
                    <svg
                      width="25"
                      height="25"
                      viewBox="0 0 25 25"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M15.375 18.5195H10.375"
                        stroke="black"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M18.375 14.5195H10.375"
                        stroke="black"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M4.375 22.5195H20.375C20.9054 22.5195 21.4141 22.3088 21.7892 21.9337C22.1643 21.5587 22.375 21.05 22.375 20.5195V4.51953C22.375 3.9891 22.1643 3.48039 21.7892 3.10532C21.4141 2.73024 20.9054 2.51953 20.375 2.51953H8.375C7.84457 2.51953 7.33586 2.73024 6.96079 3.10532C6.58571 3.48039 6.375 3.9891 6.375 4.51953V20.5195C6.375 21.05 6.16429 21.5587 5.78921 21.9337C5.41414 22.3088 4.90543 22.5195 4.375 22.5195ZM4.375 22.5195C3.84457 22.5195 3.33586 22.3088 2.96079 21.9337C2.58571 21.5587 2.375 21.05 2.375 20.5195V11.5195C2.375 10.9891 2.58571 10.4804 2.96079 10.1053C3.33586 9.73025 3.84457 9.51953 4.375 9.51953H6.375"
                        stroke="black"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M17.375 6.51953H11.375C10.8227 6.51953 10.375 6.96725 10.375 7.51953V9.51953C10.375 10.0718 10.8227 10.5195 11.375 10.5195H17.375C17.9273 10.5195 18.375 10.0718 18.375 9.51953V7.51953C18.375 6.96725 17.9273 6.51953 17.375 6.51953Z"
                        stroke="black"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <span>{data.fee}</span>
                </div>
              </div>
              <div className="flex gap-3">
                <DialogClose className="flex-1 bg-transparent border h-10 text-md">
                  Cancel
                </DialogClose>
                <Button
                  onClick={() => {
                    setModalScene("processing");
                    setTimeout(() => {
                      setModalScene("success");
                    }, 3000);
                  }}
                  className="flex-1 bg-yellow-400 hover:bg-yellow-500 h-10 text-md text-black">
                  Proceed
                </Button>
              </div>
            </div>
          </div>
        )}

        {modalScene === "processing" && (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
            <p className="text-lg font-medium">Processing your conversion...</p>
          </div>
        )}

        {modalScene === "success" && (
          <div className="flex flex-col w-full items-center justify-center  space-y-4">
            <div className="space-y-6 w-full px-6 text-center">
              <div className="flex flex-col w-full py-8 rounded-lg shadow-[0px_1px_3px_0px_rgba(0,0,0,0.02),0px_0px_0px_1px_rgba(27,31,35,0.15)] relative  items-center justify-center">
                <div className="flex justify-center items-center  rounded-lg ">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center">
                    <svg
                      width="130"
                      height="131"
                      viewBox="0 0 130 131"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M118.011 54.3726C120.481 66.4955 118.72 79.0989 113.023 90.081C107.325 101.063 98.0351 109.76 86.7014 114.721C75.3677 119.683 62.6757 120.609 50.7419 117.345C38.8081 114.081 28.3539 106.825 21.1227 96.786C13.8915 86.7472 10.3203 74.5328 11.0048 62.1797C11.6892 49.8266 16.5879 38.0815 24.8839 28.903C33.1799 19.7246 44.3718 13.6676 56.5931 11.7421C68.8144 9.8167 81.3264 12.1392 92.0426 18.3223"
                        stroke="#0765FF"
                        stroke-width="10.8178"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M48.7734 59.7822L65.0001 76.0089L119.089 21.9199"
                        stroke="#0765FF"
                        stroke-width="10.8178"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </div>
                </div>
                <div className="mx-auto w-full flex flex-col text-sm items-center justify-center">
                  <DialogClose
                    onClick={() => {
                      setTimeout(() => {
                        setModalScene("confirm");
                      }, 1000);
                    }}
                    className="absolute cursor-pointer right-4 top-4">
                    <X className="w-4 h-4" />
                  </DialogClose>
                  <h3 className="text-lg font-semibold">
                    You have successfully transferred
                  </h3>
                  <div className="text-black mx-auto items-center flex gap-2">
                    <p>
                      {" "}
                      <span className=" font-semibold">
                        {millify(Number(data.fromAmount.replace(",", "")))}
                      </span>{" "}
                      {data.fromCurrency}
                    </p>
                    to{" "}
                    <p>
                      <span className=" font-semibold">
                        {" "}
                        {millify(Number(data.toAmount.replace(",", "")))}
                      </span>{" "}
                      {data.toCurrency}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <DialogClose
                  onClick={() => {
                    setTimeout(() => {
                      setModalScene("confirm");
                    }, 1000);
                  }}
                  className="flex-1 h-12  cursor-pointer  border rounded-md ">
                  Close
                </DialogClose>
                <DialogClose
                  onClick={() => {
                    setTimeout(() => {
                      setModalScene("confirm");
                    }, 1000);
                  }}
                  className="flex-1  h-12 cursor-pointer   rounded-md   bg-yellow-400 hover:bg-yellow-500 text-black">
                  View wallet
                </DialogClose>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
