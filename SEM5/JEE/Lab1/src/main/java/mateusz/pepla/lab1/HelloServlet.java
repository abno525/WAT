package mateusz.pepla.lab1;

import java.io.*;
import java.util.List;

import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.Persistence;
import jakarta.servlet.http.*;
import jakarta.servlet.annotation.*;

@WebServlet(name = "helloServlet", value = "/hello-servlet")
public class HelloServlet extends HttpServlet {

    public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setContentType("text/html");

        // Initialize EntityManager
        EntityManagerFactory emf = Persistence.createEntityManagerFactory("default");
        EntityManager em = emf.createEntityManager();

        // Fetch all records from Animals table
        List<Animal> animals = em.createQuery("SELECT a FROM Animal a", Animal.class).getResultList();

        // Close EntityManager
        em.close();
        emf.close();

        // Generate HTML response to display animals
        PrintWriter out = response.getWriter();
        out.println("<html><body>");
        out.println("<h1>Animals in Database</h1>");

        if (animals.isEmpty()) {
            out.println("<p>No animals found in the database.</p>");
        } else {
            out.println("<ul>");
            for (Animal animal : animals) {
                out.println("<li>");
                out.println("Id: " + animal.getId() + ", ");
                out.println("Species: " + animal.getSpecies() + ", ");
                out.println("Weight: " + animal.getWeight() + " kg");
                out.println("</li>");
            }
            out.println("</ul>");
        }

        out.println("</body></html>");
    }
}
