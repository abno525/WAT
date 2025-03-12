package com.example.demo1;

import jakarta.servlet.http.*;
import jakarta.servlet.annotation.*;
import java.io.*;

@WebServlet(name = "login", value = "/login")
public class LoginServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setContentType("text/html");
        PrintWriter out = response.getWriter();

        // Check if user is already logged in
        HttpSession session = request.getSession(false);
        if (session != null && session.getAttribute("username") != null) {
            String username = (String) session.getAttribute("username");
            out.println("<h1>Welcome back, " + username + "!</h1>");
            out.println("<a href='/logout'>Logout</a>");
        } else {
            // Display the login form
            out.println("<form method='post' action='/login'>");
            out.println("<label for='username'>Username:</label>");
            out.println("<input type='text' id='username' name='username'><br>");
            out.println("<label for='password'>Password:</label>");
            out.println("<input type='password' id='password' name='password'><br>");
            out.println("<button type='submit'>Login</button>");
            out.println("</form>");
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String username = request.getParameter("username");
        String password = request.getParameter("password");

        // Validate the credentials (hardcoded for simplicity)
        if ("admin".equals(username) && "password123".equals(password)) {
            // Create a session for the user
            HttpSession session = request.getSession();
            session.setAttribute("username", username);

            // Add the testCookie indicating the user is logged in
            Cookie testCookie = new Cookie("testCookie", "true");
            testCookie.setMaxAge(24 * 60 * 60); // 1 day expiration
            response.addCookie(testCookie); // Ensure cookie is added to the response

            // Redirect to the welcome page
            response.sendRedirect("/demo1-1.0-SNAPSHOT/login");
        } else {
            response.setContentType("text/html");
            PrintWriter out = response.getWriter();
            out.println("<h1>Invalid credentials, please try again.</h1>");
            out.println("<a href='/login'>Back to Login</a>");
        }
    }
}
