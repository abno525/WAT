package bank;

public class Bankomat {
    public String model;
    public int numer;

    public Bankomat() {}

    public Bankomat(String model, int numer) {
        this.model = model;
        this.numer = numer;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public int getNumer() {
        return numer;
    }

    public void setNumer(int numer) {
        this.numer = numer;
    }

    @Override
    public String toString() {
        return "Bankomat{" +
                "model='" + model + '\'' +
                ", numer=" + numer +
                '}';
    }
}
