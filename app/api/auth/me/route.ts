import { NextResponse } from "next/server";
import { z } from "zod";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { verifyToken, comparePassword, hashPassword } from "@/lib/auth";
import { cookies } from "next/headers";

const UpdateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  profilePicture: z.string().url("Invalid image URL").or(z.literal("")).optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, "New password must be at least 6 characters").optional(),
});

export async function GET(request: Request) {
  try {
    await dbConnect();
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("GET profile error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await dbConnect();
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsedData = UpdateProfileSchema.safeParse(body);
    
    if (!parsedData.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsedData.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, profilePicture, currentPassword, newPassword } = parsedData.data;

    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Handle password change
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: "Current password is required to set a new password" }, { status: 400 });
      }

      const isMatch = await comparePassword(currentPassword, user.password);
      if (!isMatch) {
        return NextResponse.json({ error: "Incorrect current password" }, { status: 400 });
      }

      user.password = await hashPassword(newPassword);
    }

    // Handle details update
    if (name !== undefined) {
      user.name = name;
    }
    if (profilePicture !== undefined) {
      user.profilePicture = profilePicture;
    }

    await user.save();

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    console.error("PUT profile error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
