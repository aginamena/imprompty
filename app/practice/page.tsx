"use client";

import {
  Button,
  Container,
  Paper,
  Stack,
  Typography,
  Box,
} from "@mui/material";
import { RealtimeAgent, RealtimeSession, tool } from "@openai/agents/realtime";
import Image from "next/image";
import { useRef, useState } from "react";
import { z } from "zod";
import Link from "next/link";

import { prompt } from "./prompt";

export default function Practice() {
  const session = useRef<RealtimeSession | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);

  const timer = tool({
    name: "Timer",
    description: "The practice timer for the impromptu speech session.",
    parameters: z.object({}),
    async execute() {
      setIsActive(true);
      const interval = setInterval(() => {
        setSeconds((prev) => {
          if (prev >= 60) {
            clearInterval(interval);
            setIsActive(false);
            setSeconds(0);
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    },
  });

  async function startSession() {
    const agent = new RealtimeAgent({
      name: "impromptu speech coach",
      instructions: prompt,
      tools: [timer],
    });
    session.current = new RealtimeSession(agent, {
      model: "gpt-realtime-mini",
    });
    const request = await fetch("api/client_secrets");
    const { client_secrets } = await request.json();
    try {
      await session.current.connect({
        apiKey: client_secrets,
      });
      console.log("You are connected!");
      // get the agent to start the conversation
      session.current.sendMessage(
        "Lets begin our impromptu speech practice session."
      );
    } catch (e) {
      console.error(e);
    }
  }

  async function stop() {
    session.current?.close();
  }

  return (
    <Container
      sx={{
        py: { xs: 6, md: 10 },
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        maxWidth: "700px !important",
      }}
    >
      {/* HEADER */}
      <Typography
        variant="h4"
        fontWeight={700}
        gutterBottom
        sx={{ fontSize: { xs: "2rem", md: "2.4rem" } }}
      >
        Impromptu Speech Practice
      </Typography>

      <Typography
        variant="h6"
        sx={{
          mb: 3,
          opacity: 0.9,
          fontSize: { xs: "1.05rem", md: "1.2rem" },
        }}
      >
        Practice impromptu speeches with real-time coaching with our AI
        impromptu coach. Click <strong>“Start Session”</strong> to begin.
      </Typography>

      <Typography
        variant="body2"
        sx={{
          mb: 4,
          lineHeight: 1.6,
          opacity: 0.8,
        }}
      >
        We’re currently building out the full AI impromptu coach. For now,{" "}
        <strong>you have access to our beta coach </strong>. If you’d like
        access to the full coach, please fill out this{" "}
        <span
          style={{
            color: "yellow",
            fontWeight: "bold",
            textDecoration: "underline",
          }}
        >
          <Link href="https://forms.gle/45YkPR6LPG7r3LycA">form</Link>
        </span>{" "}
        and we’ll contact you for you to practice more sessions.
      </Typography>

      {/* IMAGE + LABEL */}
      <Paper
        elevation={3}
        sx={{
          p: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          borderRadius: 3,
          mb: 4,
          width: "100%",
          maxWidth: 350,
          backgroundColor: "black",
        }}
      >
        <Image
          alt="Speaking Coach"
          src="/coach.png"
          height={250}
          width={250}
          style={{ width: "100%", height: "auto" }}
        />
        <Typography
          variant="subtitle1"
          sx={{ mt: 2, fontWeight: 600, opacity: 0.9, color: "white" }}
        >
          Your Impromptu Coach
        </Typography>
      </Paper>

      {/* TIMER + STATUS */}
      {isActive && (
        <Paper
          elevation={2}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 3,
            width: "100%",
            maxWidth: 350,
          }}
        >
          <Typography variant="h6" fontWeight={700}>
            {seconds <= 15 ? "Thinking Time" : "Speaking Time"}
          </Typography>

          <Typography variant="body1" sx={{ mt: 1, fontSize: "1.2rem" }}>
            {seconds} seconds
          </Typography>
        </Paper>
      )}

      {/* BUTTONS */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 2 }}>
        <Button
          variant="contained"
          color="success"
          size="large"
          onClick={startSession}
          sx={{ fontWeight: 700, px: 4 }}
        >
          Start Session
        </Button>

        <Button
          variant="outlined"
          color="error"
          size="large"
          onClick={stop}
          sx={{ fontWeight: 700, px: 4 }}
        >
          Stop Session
        </Button>
      </Stack>
      <Box sx={{ mt: 10, textAlign: "center" }}>
        <Typography
          variant="h5"
          fontWeight={600}
          gutterBottom
          sx={{ fontSize: { xs: "1.4rem", md: "1.8rem" } }}
        >
          Move from uncertainty to confidence:
        </Typography>

        <Stack
          spacing={1}
          sx={{ opacity: 0.9, fontSize: { xs: "1rem", md: "1.1rem" } }}
        >
          <Typography>
            ❌ “I don’t know what to say.” → ✅ “I can structure my response
            instantly.”
          </Typography>
          <Typography>
            ❌ “My mind goes blank.” → ✅ “I stay calm and think clearly.”
          </Typography>
          <Typography>
            ❌ “I ramble and lose my point.” → ✅ “I speak logically and
            concisely.”
          </Typography>
          <Typography>
            ❌ “I feel nervous.” → ✅ “I sound confident and prepared.”
          </Typography>
        </Stack>
      </Box>
    </Container>
  );
}
