package bank;

public class Kredyt {
    private String data;
    private int kwota;
    private double oprocentowanie;

    public Kredyt() {}

    public Kredyt(String data, int kwota, double oprocentowanie) {
        this.data = data;
        this.kwota = kwota;
        this.oprocentowanie = oprocentowanie;
    }

    public String getData() {
        return data;
    }

    public void setData(String data) {
        this.data = data;
    }

    public int getKwota() {
        return kwota;
    }

    public void setKwota(int kwota) {
        this.kwota = kwota;
    }

    public double getOprocentowanie() {
        return oprocentowanie;
    }

    public void setOprocentowanie(double oprocentowanie) {
        this.oprocentowanie = oprocentowanie;
    }

    @Override
    public String toString() {
        return "Kredyt{" +
                "data='" + data + '\'' +
                ", kwota=" + kwota +
                ", oprocentowanie=" + oprocentowanie +
                '}';
    }
}
