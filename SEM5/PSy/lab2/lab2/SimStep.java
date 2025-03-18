package lotnisko;

import dissimlab.simcore.BasicSimEvent;
import dissimlab.simcore.SimControlException;

public class SimStep extends BasicSimEvent<Airport, Object> {


	public SimStep(Airport airport, double period) throws SimControlException {
		super(airport, null, period);
	}

	@Override
	protected void stateChange() throws SimControlException {

		getSimObj().inAir();
		getSimObj().onGround();
		getSimObj().landing();

		getSimObj().departure();
		getSimObj().monitor();

	}

	@Override
	protected void onTermination() throws SimControlException {
	}

	@Override
	public Object getEventParams() {
		return null;
	}
}
