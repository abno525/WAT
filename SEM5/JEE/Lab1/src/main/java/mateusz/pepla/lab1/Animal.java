package mateusz.pepla.lab1;

import jakarta.persistence.*;
import java.io.Serializable;

@Entity
@Table(name = "Animals")
public class Animal implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id")
    private Long id;

    @Column(name = "species")
    private String species;

    @Column(name = "weight")
    private Integer weight;

    // Getters and Setters
    public Integer getWeight() {
        return weight;
    }

    public void setWeight(Integer weight) {
        this.weight = weight;
    }

    public String getSpecies() {
        return species;
    }

    public void setSpecies(String species) {
        this.species = species;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getId() {
        return id;
    }

    // toString method
    @Override
    public String toString() {
        return "Animal{" +
                "id=" + id +
                ", species='" + species + '\'' +
                ", weight=" + weight +
                '}';
    }
}
