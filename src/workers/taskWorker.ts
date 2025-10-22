import { redis } from "@config/redis";
import { Worker } from "bullmq";
import dayjs from "dayjs";
import fs from "fs";
const worker = new Worker(
  "resapi_queue",
  async (job) => {

    const jobData = job.data;
    if (job.attemptsMade < 2) {
      // return Promise.reject để BullMQ hiểu là job fail (không cần throw)
      return Promise.reject("Simulated fail");
    }
    console.log("Processing job:", job.name, job.data);
    // Logic gửi email ở đây
    fs.appendFileSync(
      "logs/sent.log",
      `[${dayjs().format("D/M/YYYY H:mm:ss")}] ${job?.id}\n`
    );
  },
  {
    connection: redis,
    limiter: {
      max: 6,          // tối đa 6 job
      duration: 60000 // trong 60 giây (1 phút)
    },
  }
);
