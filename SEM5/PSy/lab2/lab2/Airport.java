package lotnisko;

import dissimlab.broker.INotificationEvent;
import dissimlab.broker.IPublisher;
import dissimlab.monitors.MonitoredVar;
import dissimlab.random.RNGenerator;
import dissimlab.simcore.BasicSimObj;
import dissimlab.simcore.SimControlException;

import java.util.LinkedList;
import java.util.Queue;

public class Airport extends BasicSimObj {
	int spawnTime;
	int arrivalInterval; // okres pomiędzy kolejnymi przylotami
	int arrivalTime; // czas zakończenia lądowania
	int departureInterval; // okres pomiędzy odlotami
	int departureTime; // czas następnego odlotu
	int landingInterval; // czas przerwy co przylot
	SimStep krokSymulacyjny;
	MonitoredVar mvOnTheGround, mvInTheAir, mvLanding;

	RNGenerator generator = new RNGenerator();

	Queue<Plane> inAirQueue = new LinkedList<>();
	Queue<Plane> landingQueue = new LinkedList<>();
	Queue<Plane> onGroundQueue = new LinkedList<>();
	MonitoredVar mvWaitingTimeTotal, mvWaitingTimeInAir;


	public Airport(int arrivalInterval, int departureInterval, int period)
			throws SimControlException {

		generator.setSeed(1234);
		this.spawnTime = 1;
		this.departureTime = 0;
		this.landingInterval = 0;
		this.arrivalInterval = arrivalInterval;
		this.departureInterval = departureInterval;
		krokSymulacyjny = new SimStep(this, period);
		mvOnTheGround = new MonitoredVar();
		mvInTheAir = new MonitoredVar();
		mvLanding = new MonitoredVar();
		mvWaitingTimeTotal = new MonitoredVar();
		mvWaitingTimeInAir = new MonitoredVar();
		mvLanding.setValue(1);
		mvInTheAir.setValue(0);
		mvOnTheGround.setValue(0);
	}


	/**
	 * Metoda generująca nowe samoloty w powietrzu
	 */
	public void inAir() {
		if (simTime() == spawnTime) {
			spawnTime += (int) Math.ceil(generator.exponential(arrivalInterval));
			inAirQueue.add(new Plane((int) simTime()));
		}
	}

	/**
	 * Metoda obsługująca lądowanie samolotów
	 */
	public void landing() {
		if (inAirQueue.peek() != null && landingQueue.peek() == null) {
			landingQueue.add(inAirQueue.poll());
			arrivalTime = (int) simTime() + landingQueue.peek().landingDuration;
			mvLanding.setValue(0);
			landingQueue.peek().stopWaiting((int) simTime());
			mvWaitingTimeInAir.setValue(landingQueue.peek().getTotalWaitingTime());
		} else if (landingQueue.isEmpty()) {
			mvLanding.setValue(1);
		}
	}

	/**
	 * Metoda obsługująca samoloty na ziemi
	 */
	public void onGround() {
		if (simTime() == arrivalTime) {
			landingQueue.peek().setWaitingTime((int) simTime());
			onGroundQueue.add(landingQueue.poll());
			if (!onGroundQueue.isEmpty() && departureTime < simTime())
				departureTime = (int) simTime() + departureInterval;
		}
	}

	/**
	 * Metoda obsługująca odloty samolotów
	 */
	public void departure() {
		if (simTime() == departureTime) {
			if (!onGroundQueue.isEmpty()) {
				onGroundQueue.peek().stopWaiting((int) simTime());
                mvWaitingTimeTotal.setValue(onGroundQueue.peek().getTotalWaitingTime() - departureInterval);
				onGroundQueue.poll();
				departureTime = (int) simTime() + departureInterval;
			}
		}
	}

	/**
	 * Metoda monitorująca stan lotniska
	 */
	public void monitor() {
		System.out.println(simTime() + " W powietrzu : " + inAirQueue.size()
				+ " W trakcie lądowania: " + landingQueue.size() + " Na płycie: " + onGroundQueue.size());
		mvInTheAir.setValue(inAirQueue.size());
		mvOnTheGround.setValue(onGroundQueue.size());
	}

	@Override
	public boolean filter(IPublisher publisher, INotificationEvent event) {
		return false;
	}

	@Override
	public void reflect(IPublisher publisher, INotificationEvent event) {
	}
}
