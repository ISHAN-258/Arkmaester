export interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

export interface PostureReport {
  slouching: boolean;
  phoneUsage: boolean;
  feedback: string[];
}

export function analyzePosture(landmarks: PoseLandmark[], baseline: PoseLandmark | null): PostureReport {
  const result: PostureReport = {
    slouching: false,
    phoneUsage: false,
    feedback: [],
  };

  if (!landmarks || landmarks.length < 17) {
    return result;
  }

  // Keypoint Indices
  const NOSE = 0;
  const L_EAR = 7;
  const R_EAR = 8;
  const L_SHOULDER = 11;
  const R_SHOULDER = 12;
  const L_WRIST = 15;
  const R_WRIST = 16;

  const nose = landmarks[NOSE];
  const lEar = landmarks[L_EAR];
  const rEar = landmarks[R_EAR];
  const lShoulder = landmarks[L_SHOULDER];
  const rShoulder = landmarks[R_SHOULDER];
  const lWrist = landmarks[L_WRIST];
  const rWrist = landmarks[R_WRIST];

  // 1. Phoning check (Wrists close to face/shoulders)
  const shoulderY = (lShoulder.y + rShoulder.y) / 2;
  if (
    (lWrist && lWrist.visibility > 0.5 && lWrist.y < shoulderY) ||
    (rWrist && rWrist.visibility > 0.5 && rWrist.y < shoulderY)
  ) {
    result.phoneUsage = true;
    result.feedback.push("Flagged: Distraction! Put down any mobile devices.");
  }

  // 2. Slouching check (Slumped posture reduces nose-to-shoulder vertical y-distance)
  if (nose && lShoulder && rShoulder) {
    const currentNoseToShoulder = shoulderY - nose.y;

    if (baseline) {
      const baselineShoulderY = (baseline.y + baseline.y) / 2; // approximation or direct nose comparison
      // Comparing current distance to baseline distance. If it falls below 80% of baseline, we slouch.
      const ratio = currentNoseToShoulder / baseline.y; // using baseline nose-to-shoulder stored state
      
      if (ratio < 0.82) {
        result.slouching = true;
        result.feedback.push("Flagged: Slouching! Sit upright and align your spine.");
      }
    } else {
      // General static slouching heuristic if baseline is not calibrated yet
      // Nose-to-shoulder y-distance should generally be at least 0.15 of screen coordinates
      if (currentNoseToShoulder < 0.14) {
        result.slouching = true;
        result.feedback.push("Slouching warning: Sit up straight.");
      }
    }
  }

  if (result.feedback.length === 0) {
    result.feedback.push("Posture is perfect. Keep up the solid focus!");
  }

  return result;
}
