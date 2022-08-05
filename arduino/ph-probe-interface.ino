const int analogInPin = A0;

const float powerSourceVoltage = 5.0;
const float ph7 = 7.0;
const float ph4 = 4.0;
const float ph7Voltage = 2.57; // Reading taken with pH7 solution
const float ph4Voltage = 3.06; // Reading taken with pH4 solution
const float voltageStep = abs(ph7Voltage - ph4Voltage);
const float phStepDifference = ph7 - ph4; // difference between the two known ph measurements
const float stepwiseAdjustment = voltageStep / phStepDifference;

int sensorValue = 0;
unsigned long int analogReadingSummation;
int buf[10], temp;

float computePh(float voltageReading)
{
    float voltageDiff = ph7Voltage - voltageReading;
    float phMeasurement = ph7 + (voltageDiff / stepwiseAdjustment);

    return phMeasurement;
}

void setup()
{
    Serial.begin(9600);
}

void loop()
{
    for (int i = 0; i < 10; i++)
    {
        buf[i] = analogRead(analogInPin);
        delay(30);
    }

    for (int i = 0; i < 9; i++)
    {
        for (int j = i + 1; j < 10; j++)
        {
            if (buf[i] > buf[j])
            {
                temp = buf[i];
                buf[i] = buf[j];
                buf[j] = temp;
            }
        }
    }

    analogReadingSummation = 0;
    for (int i = 2; i < 8; i++)
    {
        analogReadingSummation += buf[i];
    }

    float avgValue = analogReadingSummation / 6;

    // Convert analog reading to digital
    float voltageReading = avgValue * (powerSourceVoltage / 1024);
    float phValue = computePh(voltageReading);

    Serial.println(phValue);
    delay(500);
}