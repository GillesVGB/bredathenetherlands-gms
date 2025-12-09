exports.handler = async (event) => {
    // Voor nu simpel voorbeeld
    const meldingen = [
        { id: 1, type: "TEST", status: "pending" }
    ];
    
    return {
        statusCode: 200,
        body: JSON.stringify(meldingen)
    };
};