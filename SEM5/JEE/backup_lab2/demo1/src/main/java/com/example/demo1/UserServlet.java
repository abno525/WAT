package com.example.demo1;

import jakarta.servlet.http.*;
import jakarta.servlet.annotation.*;
import java.io.*;

@WebServlet(name = "user", value = "/user")
public class UserServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setContentType("text/html");
        PrintWriter out = response.getWriter();

        // Check the testCookie
        Cookie[] cookies = request.getCookies();
        boolean isLoggedIn = false;

        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("testCookie".equals(cookie.getName()) && "true".equals(cookie.getValue())) {
                    isLoggedIn = true;
                    break;
                }
            }
        }

        if (isLoggedIn) {
            out.println("<h1>Logged in!</h1>");
        } else {
            out.println("<h1>Logged out</h1>");
        }

        out.println("<a href='/login'>Go to Login</a>");
    }
}
