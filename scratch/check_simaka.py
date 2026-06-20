import psycopg2

db_url = "postgresql://postgres:Khouribga111*@db.tqbcmcddnohnqmcxvgut.supabase.co:5432/postgres"

def main():
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    
    # 1. Search profiles for SIMAKA
    cur.execute("SELECT id, full_name, role FROM profiles WHERE full_name ILIKE '%SIMAKA%'")
    profiles = cur.fetchall()
    print("=== PROFILES FOUND ===")
    for p in profiles:
        print(f"ID: {p[0]} | Name: {p[1]} | Role: {p[2]}")
        
        # Check pilgrim table details
        cur.execute("SELECT group_id, family_head_id, individual_flight_info, individual_hotel_info, package_price FROM pilgrims WHERE id = %s", (p[0],))
        pilgrim = cur.fetchone()
        if pilgrim:
            print(f"  Group ID: {pilgrim[0]}")
            print(f"  Family Head ID: {pilgrim[1]}")
            print(f"  Flight Info: {pilgrim[2]}")
            print(f"  Hotel Info: {pilgrim[3]}")
            print(f"  Package Price: {pilgrim[4]}")
            
    cur.close()
    conn.close()

if __name__ == '__main__':
    main()
