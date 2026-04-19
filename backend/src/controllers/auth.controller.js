import * as authService from "../services/auth.service.js";
import { success, error as apiError } from "../utils/response.js";

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, 
};

export async function login(req, res) {
    try {
        const { email, password, role } = req.body;
        const { user, accessToken, refreshToken } = await authService.loginUser({ 
            email, 
            password, 
            requiredRole: role 
        });

        res.cookie("refreshToken", refreshToken, cookieOptions);
        return success(res, { token: accessToken, user }, "Login successful");
    } catch (error) {
        return apiError(res, error.message, error.status || 400);
    }
}

export async function logout(req, res) {
    try {
        await authService.logoutUser(req.cookies.refreshToken);
        res.clearCookie("refreshToken", cookieOptions);
        return success(res, null, "Logout successful");
    } catch (error) {
        return apiError(res, error.message, 400);
    }
}

export async function refreshToken(req, res) {
    try {
        const { accessToken, newRefreshToken } = await authService.refreshUserToken(req.cookies.refreshToken);
        res.cookie("refreshToken", newRefreshToken, cookieOptions);
        return success(res, { token: accessToken });
    } catch (error) {
        return apiError(res, error.message, 401);
    }
}

export async function getMe(req, res) {
    try {
        const user = await authService.getUserProfile(req.user.id);
        return success(res, { user });
    } catch (error) {
        return apiError(res, error.message, 400);
    }
}

export async function resetPassword(req, res) {
    try {
        const { email, newPassword } = req.body;
        await authService.resetPasswordByEmail(email, newPassword);
        return success(res, null, "Password reset successful");
    } catch (error) {
        return apiError(res, error.message, error.status || 400);
    }
}
