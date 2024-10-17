

with open('points.csv', 'w') as out:
    out.write("latitude,longitude\n")
    with open("simple-gps-points-120312.txt", "r") as file:
    # with open("points.txt", "r") as file:
        for line in file:
            p = line.split(",")
            out.write(f"{int(p[0])/10**7},{int(p[1])/10**7}\n")