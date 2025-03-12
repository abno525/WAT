package com.example.demo1;

import java.io.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.Persistence;
import jakarta.servlet.http.*;
import jakarta.servlet.annotation.*;

@WebServlet(name = "helloServlet", value = "/hello-servlet")
public class HelloServlet extends HttpServlet {
    private String message;

    public void init() {
        message = "Hello World!";
    }

    public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setContentType("text/html");

        Cookie[] cookies = request.getCookies();
        String userId = null;

        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("userId".equals(cookie.getName())) {
                    userId = cookie.getValue();
                }
            }
        }

        if (userId == null) {
            response.sendRedirect("/demo1-1.0-SNAPSHOT/naming-servlet");
        }

        // powitanie
        PrintWriter out = response.getWriter();
        out.println("<html><body>");
        out.println("<h1>" + message + "</h1>");
        out.println("<p>Witaj: " + userId + "</p>");

        // zmiana imienia
        out.println("<form method='post' action='/demo1-1.0-SNAPSHOT/hello-servlet'>");
        out.println("<label for='username'>Imie:</label>");
        out.println("<input type='text' id='username' name='username'><br>");
        out.println("<button type='submit' name='action' value='changeName'>Zmien</button>");
        out.println("</form>");

        // usuwanie kart
        out.println("<form method='post' action='/demo1-1.0-SNAPSHOT/hello-servlet'>");
        out.println("<input type='text' id='cardId' name='cardId'><br>");
        out.println("<button type='submit' name='action' value='deleteCard'>Usun</button>");
        out.println("</form>");

        // dodawanie kart
        out.println("<form method='post' action='/demo1-1.0-SNAPSHOT/hello-servlet'>");
        out.println("<label for='cardType'>Typ karty:</label>");
        out.println("<input type='text' id='cardType' name='cardType'><br>");
        out.println("<label for='cardCost'>Koszt karty:</label>");
        out.println("<input type='text' id='cardCost' name='cardCost'><br>");
        out.println("<button type='submit' name='action' value='addCard'>Dodaj</button>");
        out.println("</form>");


        // wyświetlanie danych z bazy
        out.println("<h2>Lista Kart</h2>");
        out.println("<ul>");

        try {
            EntityManagerFactory emf = Persistence.createEntityManagerFactory("default");
            EntityManager em = emf.createEntityManager();

            // Pobierz dane z tabeli Card
            em.createQuery("SELECT c FROM Card c", Card.class)
                    .getResultList()
                    .forEach(card -> {
                        out.println("<li>");
                        out.println("<strong>Id:</strong> " + card.getId() + "<br>");
                        out.println("<strong>Typ:</strong> " + card.getType() + "<br>");
                        out.println("<strong>Koszt:</strong> " + card.getCost());
                        out.println("</li>");
                    });

            em.close();
            emf.close();
        } catch (Exception e) {
            out.println("<p>Błąd podczas pobierania danych z bazy: " + e.getMessage() + "</p>");
        }

        out.println("</ul>");

    }

    public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String action = request.getParameter("action");


        EntityManagerFactory emf = Persistence.createEntityManagerFactory("default");
        EntityManager em = emf.createEntityManager();

        if ("changeName".equals(action)) {
            String username = request.getParameter("username");
            boolean cookieUpdated = false;

            Cookie[] cookies = request.getCookies();
            if (cookies != null) {
                for (Cookie cookie : cookies) {
                    if ("userId".equals(cookie.getName())) {
                        cookie.setValue(username);
                        response.addCookie(cookie);
                        break;
                    }
                }
            }

            response.sendRedirect("/demo1-1.0-SNAPSHOT/hello-servlet");
        } else if ("deleteCard".equals(action)) {

            String cardId = request.getParameter("cardId");
            try {

                Long id = Long.parseLong(cardId);
                Card card = em.find(Card.class, id);

                if (card == null) {
                    System.out.println("Card not found.");
                    return;
                }

                em.getTransaction().begin();
                em.remove(card);
                em.getTransaction().commit();

            } catch (Exception e) {
                System.err.println("An error occurred: " + e.getMessage());
                if (em.getTransaction().isActive()) {
                    em.getTransaction().rollback();
                }
            }

            response.sendRedirect("/demo1-1.0-SNAPSHOT/hello-servlet");

        } else if ("addCard".equals(action)) {

            String type = request.getParameter("cardType");
            Integer cost = Integer.parseInt(request.getParameter("cardCost"));

            try {

                Card newCard = new Card();
                newCard.setType(type);
                newCard.setCost(cost);

                em.getTransaction().begin();
                em.persist(newCard);
                em.getTransaction().commit();

                System.out.println("New Card created: " + newCard);

            } catch (Exception e) {
                System.err.println("An error occurred: " + e.getMessage());
                if (em.getTransaction().isActive()) {
                    em.getTransaction().rollback();
                }
            }

            response.sendRedirect("/demo1-1.0-SNAPSHOT/hello-servlet");

        } else {
            response.sendRedirect("/demo1-1.0-SNAPSHOT/hello-servlet");
        }
    }

    public void destroy() {
    }
}
