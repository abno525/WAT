package com.example.demo1;

import jakarta.servlet.http.*;
import jakarta.servlet.annotation.*;
import java.io.*;

@WebServlet(name = "logout", value = "/logout")
public class LogoutServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        // Invalidate session
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }

        // Clear the testCookie
        Cookie testCookie = new Cookie("testCookie", "");
        testCookie.setMaxAge(0); // Expire the cookie immediately
        response.addCookie(testCookie);

        response.sendRedirect("/demo1-1.0-SNAPSHOT/login");
    }
}
