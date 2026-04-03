"""
database/seed.py
Seed the PostgreSQL database with cities and Delhi NCR zones.
Run once after init_db():  python -m database.seed
"""
import asyncio, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parents[1]))

from app.db.session import AsyncSessionLocal, init_db, City, Zone

CITIES = [
    {"id":"delhi_ncr","name":"Delhi NCR","lat":28.565,"lon":77.190,"zoom":11,"tier":1,"state":"Delhi"},
    {"id":"mumbai","name":"Mumbai","lat":19.076,"lon":72.877,"zoom":11,"tier":1,"state":"Maharashtra"},
    {"id":"bengaluru","name":"Bengaluru","lat":12.972,"lon":77.595,"zoom":11,"tier":1,"state":"Karnataka"},
    {"id":"chennai","name":"Chennai","lat":13.083,"lon":80.270,"zoom":11,"tier":1,"state":"Tamil Nadu"},
    {"id":"kolkata","name":"Kolkata","lat":22.573,"lon":88.364,"zoom":11,"tier":1,"state":"West Bengal"},
    {"id":"hyderabad","name":"Hyderabad","lat":17.385,"lon":78.487,"zoom":11,"tier":1,"state":"Telangana"},
    {"id":"pune","name":"Pune","lat":18.521,"lon":73.856,"zoom":11,"tier":1,"state":"Maharashtra"},
    {"id":"ahmedabad","name":"Ahmedabad","lat":23.023,"lon":72.572,"zoom":11,"tier":1,"state":"Gujarat"},
    {"id":"jaipur","name":"Jaipur","lat":26.913,"lon":75.787,"zoom":12,"tier":2,"state":"Rajasthan"},
    {"id":"lucknow","name":"Lucknow","lat":26.847,"lon":80.947,"zoom":12,"tier":2,"state":"UP"},
    {"id":"surat","name":"Surat","lat":21.170,"lon":72.831,"zoom":12,"tier":2,"state":"Gujarat"},
    {"id":"nagpur","name":"Nagpur","lat":21.146,"lon":79.089,"zoom":12,"tier":2,"state":"Maharashtra"},
    {"id":"indore","name":"Indore","lat":22.719,"lon":75.858,"zoom":12,"tier":2,"state":"MP"},
    {"id":"bhopal","name":"Bhopal","lat":23.259,"lon":77.413,"zoom":12,"tier":2,"state":"MP"},
    {"id":"patna","name":"Patna","lat":25.594,"lon":85.138,"zoom":12,"tier":2,"state":"Bihar"},
    {"id":"chandigarh","name":"Chandigarh","lat":30.734,"lon":76.779,"zoom":12,"tier":2,"state":"Punjab"},
    {"id":"kochi","name":"Kochi","lat":9.966,"lon":76.281,"zoom":12,"tier":2,"state":"Kerala"},
    {"id":"coimbatore","name":"Coimbatore","lat":11.017,"lon":76.955,"zoom":12,"tier":2,"state":"Tamil Nadu"},
    {"id":"visakhapatnam","name":"Visakhapatnam","lat":17.687,"lon":83.218,"zoom":12,"tier":2,"state":"AP"},
    {"id":"bhubaneswar","name":"Bhubaneswar","lat":20.296,"lon":85.824,"zoom":12,"tier":2,"state":"Odisha"},
    {"id":"vadodara","name":"Vadodara","lat":22.308,"lon":73.181,"zoom":12,"tier":2,"state":"Gujarat"},
    {"id":"kanpur","name":"Kanpur","lat":26.449,"lon":80.332,"zoom":12,"tier":2,"state":"UP"},
]

DELHI_ZONES = [
    {"id":"connaught_place","city_id":"delhi_ncr","name":"Connaught Place","lat":28.6315,"lon":77.2167,"region":"Central","zone_type":"CBD","base_demand":110,"peak_mult":1.85},
    {"id":"karol_bagh","city_id":"delhi_ncr","name":"Karol Bagh","lat":28.6510,"lon":77.1900,"region":"Central","zone_type":"Commercial","base_demand":75,"peak_mult":1.55},
    {"id":"paharganj","city_id":"delhi_ncr","name":"Paharganj","lat":28.6444,"lon":77.2100,"region":"Central","zone_type":"Mixed","base_demand":55,"peak_mult":1.30},
    {"id":"lajpat_nagar","city_id":"delhi_ncr","name":"Lajpat Nagar","lat":28.5680,"lon":77.2440,"region":"South","zone_type":"Commercial","base_demand":65,"peak_mult":1.40},
    {"id":"saket","city_id":"delhi_ncr","name":"Saket","lat":28.5270,"lon":77.2190,"region":"South","zone_type":"Mixed","base_demand":80,"peak_mult":1.45},
    {"id":"hauz_khas","city_id":"delhi_ncr","name":"Hauz Khas","lat":28.5494,"lon":77.2001,"region":"South","zone_type":"Mixed","base_demand":58,"peak_mult":1.20},
    {"id":"nehru_place","city_id":"delhi_ncr","name":"Nehru Place","lat":28.5491,"lon":77.2516,"region":"South","zone_type":"CBD","base_demand":70,"peak_mult":1.50},
    {"id":"south_ex","city_id":"delhi_ncr","name":"South Extension","lat":28.5680,"lon":77.2290,"region":"South","zone_type":"Commercial","base_demand":62,"peak_mult":1.35},
    {"id":"dwarka","city_id":"delhi_ncr","name":"Dwarka","lat":28.5921,"lon":77.0595,"region":"West","zone_type":"Residential","base_demand":68,"peak_mult":1.10},
    {"id":"janakpuri","city_id":"delhi_ncr","name":"Janakpuri","lat":28.6270,"lon":77.0830,"region":"West","zone_type":"Residential","base_demand":52,"peak_mult":1.05},
    {"id":"rajouri_garden","city_id":"delhi_ncr","name":"Rajouri Garden","lat":28.6476,"lon":77.1202,"region":"West","zone_type":"Commercial","base_demand":60,"peak_mult":1.25},
    {"id":"igi_airport","city_id":"delhi_ncr","name":"IGI Airport","lat":28.5562,"lon":77.1000,"region":"West","zone_type":"Transit","base_demand":95,"peak_mult":1.80},
    {"id":"rohini","city_id":"delhi_ncr","name":"Rohini","lat":28.7490,"lon":77.0670,"region":"North","zone_type":"Residential","base_demand":55,"peak_mult":0.95},
    {"id":"pitampura","city_id":"delhi_ncr","name":"Pitampura","lat":28.7021,"lon":77.1310,"region":"North","zone_type":"Residential","base_demand":48,"peak_mult":1.00},
    {"id":"azadpur","city_id":"delhi_ncr","name":"Azadpur","lat":28.7060,"lon":77.1790,"region":"North","zone_type":"Mixed","base_demand":42,"peak_mult":1.05},
    {"id":"laxmi_nagar","city_id":"delhi_ncr","name":"Laxmi Nagar","lat":28.6330,"lon":77.2790,"region":"East","zone_type":"Residential","base_demand":50,"peak_mult":1.10},
    {"id":"preet_vihar","city_id":"delhi_ncr","name":"Preet Vihar","lat":28.6440,"lon":77.2960,"region":"East","zone_type":"Mixed","base_demand":45,"peak_mult":1.05},
    {"id":"cyber_city","city_id":"delhi_ncr","name":"Cyber City","lat":28.4950,"lon":77.0880,"region":"Gurgaon","zone_type":"CBD","base_demand":120,"peak_mult":2.00},
    {"id":"mg_road_gurugram","city_id":"delhi_ncr","name":"MG Road Gurugram","lat":28.4759,"lon":77.0767,"region":"Gurgaon","zone_type":"Mixed","base_demand":85,"peak_mult":1.65},
    {"id":"sohna_road","city_id":"delhi_ncr","name":"Sohna Road","lat":28.4280,"lon":77.0500,"region":"Gurgaon","zone_type":"Residential","base_demand":55,"peak_mult":1.10},
    {"id":"golf_course_road","city_id":"delhi_ncr","name":"Golf Course Road","lat":28.4578,"lon":77.1022,"region":"Gurgaon","zone_type":"Mixed","base_demand":72,"peak_mult":1.40},
    {"id":"udyog_vihar","city_id":"delhi_ncr","name":"Udyog Vihar","lat":28.5040,"lon":77.0680,"region":"Gurgaon","zone_type":"Industrial","base_demand":65,"peak_mult":1.55},
    {"id":"noida_sector18","city_id":"delhi_ncr","name":"Noida Sec 18","lat":28.5700,"lon":77.3200,"region":"Noida","zone_type":"Mixed","base_demand":90,"peak_mult":1.60},
    {"id":"noida_sector62","city_id":"delhi_ncr","name":"Noida Sec 62","lat":28.6270,"lon":77.3660,"region":"Noida","zone_type":"CBD","base_demand":75,"peak_mult":1.45},
    {"id":"noida_expressway","city_id":"delhi_ncr","name":"Noida Expressway","lat":28.5034,"lon":77.3994,"region":"Noida","zone_type":"Mixed","base_demand":60,"peak_mult":1.20},
    {"id":"greater_noida","city_id":"delhi_ncr","name":"Greater Noida","lat":28.4744,"lon":77.5040,"region":"Noida","zone_type":"Mixed","base_demand":45,"peak_mult":0.90},
    {"id":"faridabad_nhpc","city_id":"delhi_ncr","name":"Faridabad","lat":28.4100,"lon":77.3100,"region":"Faridabad","zone_type":"Industrial","base_demand":50,"peak_mult":1.00},
    {"id":"vaishali","city_id":"delhi_ncr","name":"Vaishali","lat":28.6450,"lon":77.3400,"region":"Ghaziabad","zone_type":"Residential","base_demand":62,"peak_mult":1.15},
    {"id":"indirapuram","city_id":"delhi_ncr","name":"Indirapuram","lat":28.6700,"lon":77.3640,"region":"Ghaziabad","zone_type":"Residential","base_demand":58,"peak_mult":1.10},
    {"id":"raj_nagar_ext","city_id":"delhi_ncr","name":"Raj Nagar Ext","lat":28.6924,"lon":77.4440,"region":"Ghaziabad","zone_type":"Residential","base_demand":38,"peak_mult":0.90},
]


async def seed():
    await init_db()
    async with AsyncSessionLocal() as session:
        for c in CITIES:
            existing = await session.get(City, c["id"])
            if not existing:
                session.add(City(**c))

        for z in DELHI_ZONES:
            existing = await session.get(Zone, z["id"])
            if not existing:
                session.add(Zone(**z))

        await session.commit()
    print(f"[seed] ✓ {len(CITIES)} cities, {len(DELHI_ZONES)} Delhi NCR zones seeded.")


if __name__ == "__main__":
    asyncio.run(seed())
