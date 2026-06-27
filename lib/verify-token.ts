// lib/verify-token.ts
import * as admin from "firebase-admin";

export async function verifyToken(request: Request): Promise<string | null> {
  const authHeader = request.headers.get("Authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  
  const token = authHeader.split("Bearer ")[1];
  
  try {
    // If your firebase-admin isn't globally initialized yet in this exact execution context,
    // ensure your lib/firebase-admin.ts is imported somewhere in the route first.
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken.uid;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}
