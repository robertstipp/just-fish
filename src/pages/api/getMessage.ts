// pages/api/getMessage.js
import protobuf from "protobufjs";
import path from "path";
import { NextApiRequest, NextApiResponse } from "next";
import { Fish } from "@/lib/types";

const initFish: Fish = {
  x: 50,
  y: 50,
  size: 50,
};

let currentVector = Math.random() * 2 * Math.PI;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const root = await protobuf.load(path.resolve("src/proto/fish.proto"));
  const Message = root.lookupType("justfish.Fish");

  // Move Fish

  initFish.x = Math.floor(initFish.x + Math.cos(currentVector) * 4);
  initFish.y = Math.floor(initFish.y + Math.sin(currentVector) * 4);

  if (initFish.x - 10 < 0 || initFish.x + 10 > 100) {
    currentVector += Math.sin(currentVector) > 0 ? Math.PI : -Math.PI;
  }

  if (initFish.y - 10 < 0 || initFish.y + 10 > 100) {
    currentVector += Math.cos(currentVector) > 0 ? Math.PI : -Math.PI / 2;
  }

  currentVector = (currentVector + 2 * Math.PI) % (2 * Math.PI);

  const payload = {
    x: initFish.x,
    y: initFish.y,
    size: initFish.size,
  };

  const errMsg = Message.verify(payload);
  if (errMsg) throw Error(errMsg);

  // Encode a message to protobuf format (Uint8Array)
  const message = Message.create(payload);
  const buffer = Message.encode(message).finish();

  // Send the protobuf message as a response
  res.setHeader("Content-Type", "application/octet-stream");
  res.send(buffer);
}
