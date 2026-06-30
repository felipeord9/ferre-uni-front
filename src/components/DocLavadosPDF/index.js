import { Document, Page, View, Text, StyleSheet , Image } from "@react-pdf/renderer";
import "./styles.css";
import { useEffect, useState } from "react";
import { config } from "../../config";
import { verificarArchivo } from "../../services/evidence";

const styles = StyleSheet.create({
  headerText: {
    fontSize: 11,
    fontWeight: "bold",
  },
  clientText: {
    fontSize: 11,
    textAlign: "left",
    fontWeight: "bold",
  },
  table: {
    display: "table",
    width: "100%",
    fontSize: 8,
    marginTop: 6,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableCell: {
    fontWeight: 500,
    overflow: "hidden",
    border: "1px solid black",
    padding: "8px 5px",
  },
  columnWidth0: {
    width: "10%",
  },
  columnWidth1: {
    width: "25%",
  },
  columnWidth2: {
    width: "50%",
  },
  columnWidth3: {
    width: "75%",
  },
  columnWidth4: {
    width: "100%",
  },
  columnWidth5: {
    width: "12%",
  },
  columnWidth6: {
    width: "32%",
  },
  imgDocumentos: {
    width: '100%',
    height: 90,
  },
});

export default function DocOrderPDF({ order }) {
  const [video, setVideo] = useState(null);
  const [foto, setFoto] = useState(null);

  useEffect(async () => {
    const foto = `id_${order.id}.jpg`
    const directFoto = `${config.apiUrl2}/upload/obtener-archivo/${foto}`
     const video = `id_${order.id}.webm`
    const directVideo = `${config.apiUrl2}/upload/obtener-archivo/${video}`
    const url = await verificarArchivo(directVideo)
    const url2 = await verificarArchivo(directFoto)
    if(url){
      setVideo(url);
    } 
    if(url2){
      setFoto(url2);
    }
  },[])
  return (
    order && (
      <Document
        title={`${(order?.coId !== null) ? order?.coId : order?.clientId }-Devoluciones y averías`}
        author="Gran Langostino S.A.S"
        subject="Devoluciones y averías"
        keywords="Devoluciones y averías langostino"
        creator="Gran Langostino S.A.S"
        producer="Gran Langostino S.A.S"
        pageMode="fullScreen"
      >
        <Page size={"A4"}>
          <View
            style={{
              fontFamily: "Helvetica",
              display: "flex",
              flexDirection: "column",
              padding: "15px",
              textAlign: "left",
            }}
          >
            <View
              style={{
                fontSize: 13,
                textAlign: "center",
              }}
            >
              <Text
                style={{
                  fontFamily: "Helvetica-Bold",
                  fontWeight: "extrabold",
                }}
              >
                DEVOLUCIONES Y AVERÍAS
              </Text>
              <Text style={{ fontSize:8, marginBottom:2, marginTop:5 }}>
                Nota: Este documento no corresponde a una requisición o nota crédito
              </Text>
            </View>
            <View style={styles.table}>
              <View style={{ ...styles.tableRow, alignItems: "center" }}>
                <View
                  style={{
                    ...styles.columnWidth3,
                    gap: 2,
                  }}
                >
                  <Text style={{ fontFamily: "Helvetica-Bold" }}>
                    El Gran Langostino S.A.S
                  </Text>
                  <Text style={{ fontFamily: "Helvetica-Bold" }}>
                    Nit: 835001216
                  </Text>
                  <Text>Tel: 5584982 - 3155228124</Text>
                </View>
                <View style={styles.columnWidth6}>
                  <View
                    style={{
                      display: "table",
                      border: "1 solid #000",
                    }}
                  >
                    <Text style={{ ...styles.tableRow, padding: 3 , paddingTop: 1, paddingBottom:1}}>
                      <Text style={{ fontFamily: "Helvetica-Bold" }}>
                        Fecha creación:{" "}
                      </Text>
                      {new Date(order?.createdAt).toLocaleString("es-CO")}
                    </Text>
                    <Text style={{ ...styles.tableRow, padding: 3 , paddingTop: 1, paddingBottom:1 }}>
                      <Text style={{ fontFamily: "Helvetica-Bold" }}>
                        Doc. asociado:{" "}
                      </Text>
                      {order?.associatedDocument}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
            <View
              style={{
                border: 1,
                borderColor: "#000",
                borderStyle: "solid",
                marginVertical: 10,
              }}
            ></View>
            <View
              style={{
                ...styles.table,
                padding: 0,
                margin: 0,
              }}
            >
              <View style={{ ...styles.tableRow, gap: 15 }}>
                <View style={styles.columnWidth3}>
                  {(order.clientId !== null || order.clientId !== '') &&
                    <View
                      style={{
                        position: "relative",
                        border: 1,
                        borderColor: "#000",
                        borderStyle: "solid",
                        borderRadius: 5,
                        padding: 7,
                        gap: 5,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "Helvetica-Bold",
                          backgroundColor: "#ffffff",
                          position: "absolute",
                          top: "-5px",
                          left: "25px",
                          paddingHorizontal: 10,
                        }}
                      >
                        Solicitante
                      </Text>
                      <Text >
                        <Text style={{ fontFamily: "Helvetica-Bold" }}>
                          Nit:{" "}
                        </Text>
                        {(order.clientId !== null) ? order.clientId : '835.001.216-8'}
                      </Text>
                      <Text style={{ paddingTop: 2 }}>
                        <Text style={{ fontFamily: "Helvetica-Bold"}}>
                          Nombre:{" "}
                        </Text>
                        {order.clientDescription !== null ? order.clientDescription : 'El Gran Langostino S.A.S'}
                      </Text>
                      <Text style={{ paddingTop: 3 }}>
                        <Text style={{ fontFamily: "Helvetica-Bold" }}>
                          Sucursal:{" "}
                        </Text>
                        {order.branchDescription !== null ? order.branchDescription : `${order.coId} - ${order.coDescription}`}
                      </Text>
                      {(order.state !== 'Rechazado' && order.state !== 'Solicitado') &&
                        <Text style={{ paddingTop: 3 }}>
                          <Text style={{ fontFamily: "Helvetica-Bold" }}>
                            {(order.authorizationDate && order.state === 'Rechazado') ?  `Rechazado por:${" "}` : `Autorizado por:${" "}`}
                          </Text>
                          {(order.state === 'Autorizado' || order.state === 'Recogido' || order.state === 'Finalizado' || order.state === 'Rechazado' ) ? (order.clientId !== null ? 'Jorge Cultid' : `Angie Segura`) : ''}
                        </Text>
                      }
                      {(order.state !== 'Rechazado' && order.state !== 'Solicitado') &&
                        <Text style={{ paddingTop: 3 }}>
                          <Text style={{ fontFamily: "Helvetica-Bold" }}>
                            {(order.authorizationDate && order.state === 'Rechazado') ?  `Fecha Rechazo:${" "}` : `Fecha Autorización:${" "}`}
                          </Text>
                          {order.authorizationDate ? new Date(order.authorizationDate).toLocaleString("es-CO") : ''}
                        </Text>
                      }
                      {(order.state !== 'Rechazado' && order.state !== 'Solicitado' && order.state !== 'Autorizado') &&
                      <Text style={{ paddingTop: 3 }}>
                        <Text style={{ fontFamily: "Helvetica-Bold" }}>
                          Quien recoge:{" "}
                        </Text>
                        {order.nameDriver ? order.nameDriver : ''}
                      </Text>
                      }
                      {order.state !== 'Rechazado' && order.state !== 'Solicitado' && order.state !== 'Autorizado' &&
                      <Text style={{ paddingTop: 3 }}>
                        <Text style={{ fontFamily: "Helvetica-Bold" }}>
                          Quien recibe:{" "}
                        </Text>
                        {order.nameReceiver ? order.nameReceiver : ''}
                      </Text>
                      }
                      {(order.state !== 'Rechazado' && order.state !== 'Solicitado' && order.state !== 'Autorizado') &&
                      <Text style={{ paddingTop: 3 }}>
                        <Text style={{ fontFamily: "Helvetica-Bold" }}>
                          Fecha Recogida:{" "}
                        </Text>
                        {order.colletedDate ? new Date(order.colletedDate).toLocaleString("es-CO") : ''}
                      </Text>
                      }
                      {(order.state !== 'Rechazado' && order.state !== 'Solicitado' && order.state !== 'Autorizado' && order.state !== 'Recogido') &&
                      <Text style={{ paddingBottom: 5 , paddingTop: 3 }}>
                        <Text style={{ fontFamily: "Helvetica-Bold" }}>
                          Fecha Finalización:{" "}
                        </Text>
                        {order.endDate ? new Date(order.endDate).toLocaleString("es-CO") : ''}
                      </Text>
                      }
                    </View>
                  }
                </View>
                <View style={styles.columnWidth3}>
                  <View
                    style={{
                      position: "relative",
                      border: 1,
                      borderColor: "#000",
                      borderStyle: "solid",
                      borderRadius: 5,
                      paddingTop: 5,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Helvetica-Bold",
                        backgroundColor: "#ffffff",
                        position: "absolute",
                        top: "-5px",
                        left: "25px",
                        paddingHorizontal: 10,
                      }}
                    >
                      Evidencia
                    </Text>
                    {(!foto && (!video || video) ) ? 
                      <View style={styles.imgDocumentos}></View>
                      : (foto) &&
                      <Image 
                        style={styles.imgDocumentos}
                        src={foto}
                      />
                    }
                  </View>
                </View>
              </View>
            </View>
            <View
              style={{
                ...styles.table,
                border: 1,
                borderColor: "#000",
                borderStyle: "solid",
                height: "100%",
              }}
            >
              <View
                style={{
                  ...styles.tableRow,
                  fontFamily: "Helvetica-Bold",
                  backgroundColor: "#d6d6d6",
                }}
              >
                <View style={styles.columnWidth0}>
                  <Text style={styles.tableCell}>Ref.</Text>
                </View>
                <View style={styles.columnWidth2}>
                  <Text style={styles.tableCell}>Descripción</Text>
                </View>
                <View style={styles.columnWidth5}>
                  <Text style={styles.tableCell}>Cantidad</Text>
                </View>
                <View style={styles.columnWidth0}>
                  <Text style={styles.tableCell}>UM</Text>
                </View>
                <View style={styles.columnWidth1}>
                  <Text style={styles.tableCell}>Motivo</Text>
                </View>
                {/* <View style={{ width: "130px" }}>
                  <Text style={styles.tableCell}>Valor Total</Text>
                </View> */}
              </View>
              <View style={{ display: "flex", height: "42vh" }}>
                {order?.items.map((elem) => (
                  <View style={styles.tableRow}>
                    <View style={styles.columnWidth0}>
                      <Text style={styles.tableCell}>{elem?.id}</Text>
                    </View>
                    <View style={styles.columnWidth2}>
                      <Text style={styles.tableCell}>{elem?.description}</Text>
                    </View>
                    <View style={styles.columnWidth5}>
                      <Text style={styles.tableCell}>
                        {elem?.ReturnProduct.amount}
                      </Text>
                    </View>
                    <View style={styles.columnWidth0}>
                      <Text style={styles.tableCell}>{elem?.um}</Text>
                    </View>
                    <View style={styles.columnWidth1}>
                      <Text style={styles.tableCell}>
                        {(elem?.ReturnProduct.reason)}
                      </Text>
                    </View>
                    {/* <View style={{ width: "130px" }}>
                      <Text style={styles.tableCell}>
                        $
                        {formater(
                          parseFloat(elem.ReturnProduct.amount) *
                            parseInt(elem.ReturnProduct.price)
                        )}
                      </Text>
                    </View> */}
                  </View>
                ))}
              </View>
            </View>
            <View
              style={{
                ...styles.tableRow,
                backgroundColor: "#d6d6d6",
                fontSize: 8,
                marginBottom: 10,
              }}
            >
              <View style={styles.columnWidth4}>
                <Text style={styles.tableCell}>TOTAL ITEMS</Text>
              </View>
              <View style={{ width: "60px !important" , textAlign: 'center' }}>
                <Text style={styles.tableCell}>{order?.items.length}</Text>
              </View>
            </View>
            <View style={{ height: 130, fontSize: 8 }}>
              <View
                style={{
                  position: "relative",
                  border: 1,
                  borderColor: "#000",
                  borderStyle: "solid",
                  borderRadius: 5,
                }}
              >
                <Text
                  style={{
                    fontFamily: "Helvetica-Bold",
                    backgroundColor: "#ffffff",
                    position: "absolute",
                    top: "-5px",
                    left: "25px",
                    paddingHorizontal: 10,
                  }}
                >
                  Observaciones
                </Text>
                <Text style={{padding: 10}}>{order?.observations}</Text>
              </View>
            </View>
          </View>
        </Page>
      </Document>
    )
  );
}
