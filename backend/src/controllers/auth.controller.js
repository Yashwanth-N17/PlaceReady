import * as authService from "../services/auth.service.js";

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, 
};

export async function login(req, res) {
    try {
        const { email, password } = req.body;
        const { accessToken, refreshToken, user } = await authService.loginUser(email, password);

        res.cookie("refreshToken", refreshToken, cookieOptions);

        return res.status(200).json({
            message: "Login successful",
            token: accessToken,
            user,
        });
    } catch (error) {
        return res.status(error.status || 400).json({ message: error.message });
    }
}

export async function logout(req, res) {
    try {
        await authService.logoutUser(req.cookies.refreshToken);
        res.clearCookie("refreshToken", cookieOptions);

        return res.status(200).json({
            message: "Logout successful",
        });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
}

export async function refreshToken(req, res) {
    try {
        const { accessToken, newRefreshToken } = await authService.refreshUserToken(req.cookies.refreshToken);

        res.cookie("refreshToken", newRefreshToken, cookieOptions);

        return res.status(200).json({ token: accessToken });
    } catch (error) {
        return res.status(401).json({ message: error.message });
    }
}

export async function getMe(req, res) {
    try {
        const user = await authService.getUserProfile(req.user.id);
        return res.status(200).json({ user });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
}

export async function resetPassword(req, res) {
    try {
        const { email, newPassword } = req.body;
        await authService.resetPasswordByEmail(email, newPassword);

        return res.status(200).json({
            message: "Password reset successful",
        });
    } catch (error) {
        return res.status(error.status || 400).json({ message: error.message });
    }
}
