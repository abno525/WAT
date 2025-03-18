package lotnisko;

import dissimlab.monitors.Diagram;
import dissimlab.monitors.Diagram.DiagramType;
import dissimlab.monitors.Statistics;
import dissimlab.simcore.SimControlException;
import dissimlab.simcore.SimManager;

public class AppSingle {
	
	public static void main(String[] args) {
		try{
			SimManager simMgr = SimManager.getInstance();
			
			//Lotnisko lotnisko = new Lotnisko(2, 3, 4, 1, simMgr);
			Airport airport = new Airport(1,  3, 1);
			
			// Dwa sposoby planowanego końca symulacji
			simMgr.setEndSimTime(10000);
			// lub
			//SimControlEvent stopEvent = new SimControlEvent(20.0, SimControlStatus.STOPSIMULATION);

			// Uruchomienie symulacji metodą "start"
			simMgr.startSimulation();

			Diagram d1 = new Diagram(DiagramType.TIME, "R-inTheAir G-onTheGround B-runwayFree");
			d1.add(airport.mvInTheAir, java.awt.Color.RED);
			d1.add(airport.mvOnTheGround, java.awt.Color.GREEN);
			d1.add(airport.mvLanding, java.awt.Color.BLUE);
			d1.add(airport.mvWaitingTimeTotal, java.awt.Color.BLACK);
			d1.show();

			System.out.println("Średni czas oczekiwania w powietrzu wynosił:\t" + Statistics.arithmeticMean(airport.mvWaitingTimeInAir));
			System.out.println("Średni czas oczekiwania na płycie wynosił:  \t" + (Statistics.arithmeticMean(airport.mvWaitingTimeTotal) - Statistics.arithmeticMean(airport.mvWaitingTimeInAir)));
			System.out.println("Średni czas oczekiwania na lotnisku wynosił:\t" + Statistics.arithmeticMean(airport.mvWaitingTimeTotal));
		}
		catch (SimControlException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
}
