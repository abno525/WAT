/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.mycompany.project1;

/**
 *
 * @author plato
 */
import java.io.IOException;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.Cookie;
@WebServlet("/RedirectServlet")
public class RedirectServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        // Get the user's name from the form
        String userName = request.getParameter("userName");
        if (userName != null && !userName.trim().isEmpty()) {
            // Set a cookie with the user's name
            Cookie nameCookie = new Cookie("userName", userName);
            nameCookie.setMaxAge(60 * 5); // Cookie valid for 5 minutes
            response.addCookie(nameCookie);

            // Redirect to HelloServlet instead of hello.html
            response.sendRedirect("HelloServlet");
        } else {
            response.getWriter().println("Name cannot be empty. Please go back and enter your name.");
        }
    }
}