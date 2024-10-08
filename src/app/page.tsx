"use client";
import { Fish } from "@/lib/types";
import { useState, useEffect } from "react";
import protobuf from "protobufjs";

import fishDescriptor from "../proto/fish_descriptor.json";

export default function Home() {
  const fish1: Fish = {
    size: 10,
    x: 50,
    y: 50,
  };

  const [fishData, setFishData] = useState<Fish[]>([fish1]);

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const response = await fetch("/api/getMessage");
        const buffer = await response.arrayBuffer();
        const uint8Array = new Uint8Array(buffer);
        const root = protobuf.Root.fromJSON(fishDescriptor);
        const Message = root.lookupType("justfish.Fish");

        const decodedMessage = Message.decode(uint8Array).toJSON() as Fish;
        console.log(decodedMessage);

        // Load the protobuf definition on the client
        // const root = await protobuf.load(userProto);
        // const Message = root.lookupType("your.package.User");

        // Decode the protobuf message
        // const decodedMessage = Message.decode(uint8Array);
        setFishData([decodedMessage]);
      } catch (err) {
        console.error("Failed to fetch or decode protobuf message", err);
      }
    };

    const intervalId = setInterval(() => {
      fetchMessage();
    }, 100);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="bg-black h-full w-full relative">
      {fishData.map((fish: Fish, index: number) => {
        const { x, y } = fish;
        return (
          <div
            key={index}
            className="absolute h-10 w-10 round-full bg-white"
            style={{ left: `${x}%`, top: `${y}%` }}
          ></div>
        );
      })}
    </div>
  );
}
