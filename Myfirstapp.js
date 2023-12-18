java
import android.Manifest;
import android.content.Context;
import android.content.pm.PackageManager;
import android.location.GnssMeasurementsEvent;
import android.location.GnssMeasurementsEvent.Callback;
import android.location.GnssMeasurement;
import android.location.GnssMeasurementsStatusCodes;
import android.location.GnssNavigationMessage;
import android.location.GnssStatus;
import android.location.GnssStatus.Callback;
import android.location.GnssStatusListener;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Bundle;
import android.support.v4.app.ActivityCompat;
import android.support.v7.app.AppCompatActivity;
import android.util.Log;
import android.widget.Toast;

import java.util.ArrayList;
import java.util.List;

public class RadioScannerActivity extends AppCompatActivity {

    private static final int PERMISSION_REQUEST_CODE = 1;
    private static final String TAG = "RadioScannerActivity";

    private LocationManager locationManager;
    private LocationListener locationListener;
    private GnssStatusListener gnssStatusListener;
    private GnssMeasurementsEvent.Callback measurementsCallback;

    private List<GnssMeasurement> gnssMeasurementsList;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_radio_scanner);

        // Check location permission
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION)
                != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this,
                    new String[]{Manifest.permission.ACCESS_FINE_LOCATION},
                    PERMISSION_REQUEST_CODE);
        } else {
            initializeLocationManager();
            registerGnssListeners();
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == PERMISSION_REQUEST_CODE) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                initializeLocationManager();
                registerGnssListeners();
            } else {
                Toast.makeText(this, "Location permission denied", Toast.LENGTH_SHORT).show();
                finish();
            }
        }
    }

    private void initializeLocationManager() {
        locationManager = (LocationManager) getSystemService(LOCATION_SERVICE);

        locationListener = new LocationListener() {
            @Override
            public void onLocationChanged(Location location) {
                // Handle location changes
                Log.d(TAG, "Location Changed: " + location);
            }

            @Override
            public void onStatusChanged(String provider, int status, Bundle extras) {
                // Handle provider status changes
                Log.d(TAG, "Status Changed: " + provider + ", Status: " + status);
            }

            @Override
            public void onProviderEnabled(String provider) {
                // Handle provider enabled
                Log.d(TAG, "Provider Enabled: " + provider);
            }

            @Override
            public void onProviderDisabled(String provider) {
                // Handle provider disabled
                Log.d(TAG, "Provider Disabled: " + provider);
            }
        };

        gnssStatusListener = new GnssStatus.Callback() {
            @Override
            public void onSatelliteStatusChanged(GnssStatus status) {
                // Handle satellite status changes
                Log.d(TAG, "Satellite Status Changed: " + status);
            }

            @Override
            public void onStarted() {
                // GNSS started
                Log.d(TAG, "GNSS Started");
            }

            @Override
            public void onStopped() {
                // GNSS stopped
                Log.d(TAG, "GNSS Stopped");
            }
        };

        measurementsCallback = new GnssMeasurementsEvent.Callback() {
            @Override
            public void onGnssMeasurementsReceived(GnssMeasurementsEvent event) {
                // Handle received GNSS measurements
                List<GnssMeasurement> measurements = event.getMeasurements();
                for (GnssMeasurement measurement : measurements) {
                    // Process the measurement data
                    Log.d(TAG, "Received GNSS Measurement: " + measurement.toString());
                }
            }

            @Override
            public void onStatusChanged(int status) {
                // Handle GNSS measurements status changes
                if (status == GnssMeasurementsStatusCodes.STATUS_NOT_SUPPORTED) {
                    Log.d(TAG, "GNSS measurements not supported");
                } else if (status == GnssMeasurementsStatusCodes.STATUS_READY) {
                    Log.d(TAG, "GNSS measurements ready");
                } else if (status == GnssMeasurementsStatusCodes.STATUS_TEMPORARILY_UNAVAILABLE) {
                    Log.d(TAG, "GNSS measurements temporarily unavailable");
                }
            }
        };

        gnssMeasurementsList = new ArrayList<>();
    }

    private void registerGnssListeners() {
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION)
                == PackageManager.PERMISSION_GRANTED) {
            locationManager.requestLocationUpdates(LocationManager.GPS_PROVIDER, 0, 0, locationListener);
            locationManager.registerGnssStatusCallback(gnssStatusListener);
            locationManager.registerGnssMeasurementsCallback(measurementsCallback);
        }
    }

    private void unregisterGnssListeners() {
        locationManager.removeUpdates(locationListener);
        locationManager.unregisterGnssStatusCallback(gnssStatusListener);
        locationManager.unregisterGnssMeasurementsCallback(measurementsCallback);
    }

    @Override
    protected void onResume() {
        super.onResume();
        registerGnssListeners();
    }

    @Override
    protected void onPause() {
        super.onPause();
        unregisterGnssListeners();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        unregisterGnssListeners();
  } 
}

`